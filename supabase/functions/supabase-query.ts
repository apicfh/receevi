import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '../../database.types'
import { z } from 'zod'

type TableName = keyof Database['public']['Tables']
type QueryMethod = 'select' | 'insert' | 'delete' | 'update'
type QueryOperator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in' | 'neq' | 'ilike'

interface FilterCondition {
    field: string
    operator: QueryOperator
    value: any
}

interface QueryOptions<T extends TableName> {
    tableName: T
    method: QueryMethod
    columns?: Array<keyof Database['public']['Tables'][T]['Row']>
    filterConditions?: FilterCondition[]
    insertData?: Partial<Database['public']['Tables'][T]['Insert']>
    updateData?: Partial<Database['public']['Tables'][T]['Update']>
    pagination?: { from?: number; to?: number }
    orderBy?: { column: string; ascending?: boolean }
}

export async function supabaseServerQuery<T extends TableName>({
                                                                   tableName,
                                                                   method,
                                                                   columns = ['*'],
                                                                   filterConditions = [],
                                                                   insertData,
                                                                   updateData,
                                                                   pagination,
                                                                   orderBy
                                                               }: QueryOptions<T>) {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase URL is not configured')
    }

    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
            cookies: {
                get(name: string) {
                    return cookies().get(name)?.value
                }
            }
        }
    )

    try {
        // Start with base query
        let query = supabase.from(tableName).select(columns.join(', '))

        // Apply filter conditions
        filterConditions.forEach(condition => {
            switch (condition.operator) {
                case 'eq': query = query.eq(condition.field, condition.value); break
                case 'neq': query = query.neq(condition.field, condition.value); break
                case 'gt': query = query.gt(condition.field, condition.value); break
                case 'lt': query = query.lt(condition.field, condition.value); break
                case 'gte': query = query.gte(condition.field, condition.value); break
                case 'lte': query = query.lte(condition.field, condition.value); break
                case 'like': query = query.like(condition.field, condition.value); break
                case 'ilike': query = query.ilike(condition.field, condition.value); break
                case 'in': query = query.in(condition.field, condition.value); break
            }
        })

        // Apply pagination if specified
        if (pagination) {
            query = query.range(
                pagination.from || 0,
                pagination.to || 9999
            )
        }

        // Apply ordering if specified
        if (orderBy) {
            query = query.order(orderBy.column, {
                ascending: orderBy.ascending ?? true
            })
        }

        // Method-specific operations
        switch (method) {
            case 'insert':
                if (!insertData) throw new Error('Insert data is required')
                query = query.insert(insertData)
                break
            case 'update':
                if (!updateData) throw new Error('Update data is required')
                query = query.update(updateData)
                break
            case 'delete':
                query = query.delete()
                break
        }

        // Execute the query
        const { data, error } = await query

        if (error) {
            throw new Error(`Supabase Query Error: ${error.message}`)
        }

        return {
            data: data as Database['public']['Tables'][T]['Row'][],
            error: null
        }
    } catch (error) {
        // Use a logging service in production
        console.error(`[Supabase Query Error - ${tableName}]:`, error)

        return {
            data: null,
            error: error instanceof Error
                ? error
                : new Error('Unexpected error during Supabase query')
        }
    }
}