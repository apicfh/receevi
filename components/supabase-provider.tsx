'use client'

import { createContext, useContext, useState } from 'react'
import { createClient } from '@/utils/supabase-browser'
import { queryDatabase } from '@/utils/supabase-query'

import type { Database } from '@/lib/database.types'
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js'

type FilterOperation = 'equal' | 'not_equal' | 'greater_than' | 'less_than' | 'like' | 'ilike' | 'in' | 'is' | 'is_not' | 'contains';

interface FilterOption {
    column: string;
    operation: FilterOperation;
    value: any;
}

interface QueryResult<T = any> {
    data: T | null;
    error: PostgrestError | Error | null;
    success: boolean;
}

type SupabaseContext = {
    supabase: SupabaseClient<Database>;
    query: <T = any>(
        tableName: string,
        mode: 'insert' | 'select' | 'update' | 'remove',
        columns?: string[],
        filter?: FilterOption[],
        data?: Record<string, any>,
        primaryKey?: { column: string; value: any }
    ) => Promise<QueryResult<T>>;
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createClient())

    // Create a wrapper for the queryDatabase function that uses the client-side Supabase instance
    const query = async <T = any>(
        tableName: string,
        mode: 'insert' | 'select' | 'update' | 'remove',
        columns?: string[],
        filter?: FilterOption[],
        data?: Record<string, any>,
        primaryKey?: { column: string; value: any }
    ): Promise<QueryResult<T>> => {
        // We're passing the client-side Supabase instance to queryDatabase
        return queryDatabase<T>(
            supabase,
            tableName,
            mode,
            {
                columns,
                filter,
                data,
                primaryKey
            }
            );
    }

    return (
        <Context.Provider value={{ supabase, query }}>
            <>{children}</>
        </Context.Provider>
    )
}

export const useSupabase = () => {
    let context = useContext(Context);
    if (context === undefined) {
        throw new Error("useSupabase must be used inside SupabaseProvider");
    } else {
        return context;
    }
}