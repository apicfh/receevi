import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import {Broadcast} from "../supabase/functions/bulk-send/types";

// Define types for filter operations
type FilterOperation = 'equal' | 'not_equal' | 'greater_than' | 'less_than' | 'like' | 'ilike' | 'in' | 'is' | 'is_not' | 'contains';

// Define type for filter object
interface FilterOption {
  column: string;
  operation: FilterOperation;
  value: any;
}

// Define return type for the query function
interface QueryResult<T = any> {
  data: T | null;
  error: PostgrestError | Error | null;
  success: boolean;
}

/**
 * A helper function to query the Supabase database
 * @param supabase The Supabase client to use
 * @param tableName The name of the table to query
 * @param mode The query mode ("insert", "select", "update", or "remove")
 * @param options Optional parameters object containing:
 *   - columns: String array of column names to select (for "select" mode only, defaults to '*')
 *   - filter: Optional filter object for "select" mode
 *   - data: Optional data for "insert" or "update" modes
 *   - primaryKey: Optional primary key for "remove" or "update" modes
 * @returns QueryResult with data, error, and success status
 */
export async function queryDatabase<T = any>(
    supabase: SupabaseClient<Database>,
    tableName: string,
    mode: 'insert' | 'select' | 'update' | 'remove',
    options?: {
      columns?: string[];
      filter?: FilterOption[];
      data?: Record<string, any>;
      primaryKey?: { column: string; value: any };
    }
): Promise<QueryResult<T>> {
  // Extract options
  const columns = options?.columns;
  const filter = options?.filter;
  const data = options?.data;
  const primaryKey = options?.primaryKey;

  // First, check if the table exists
  try {
    // This query will throw an error if the table doesn't exist
    const { error } = await supabase.from(tableName).select('*').limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log(`Querying a non-existing table: ${tableName}`);
      return { data: null, error: new Error(`Querying a non-existing table: ${tableName}`), success: false };
    }
  } catch (error) {
    console.log(`Querying a non-existing table: ${tableName}`);
    return { data: null, error: error as Error, success: false };
  }

  // Process based on mode
  switch (mode) {
    case 'select': {
      // Use specified columns or default to '*'
      const columnsString = columns && columns.length > 0 ? columns.join(', ') : '*';
      let query = supabase.from(tableName).select(columnsString);

      // Apply filters if provided
      if (filter && Array.isArray(filter)) {
        try {
          filter.forEach(f => {
            switch (f.operation) {
              case 'equal':
                query = query.eq(f.column, f.value);
                break;
              case 'not_equal':
                query = query.neq(f.column, f.value);
                break;
              case 'greater_than':
                query = query.gt(f.column, f.value);
                break;
              case 'less_than':
                query = query.lt(f.column, f.value);
                break;
              case 'like':
                query = query.like(f.column, f.value);
                break;
              case 'ilike':
                query = query.ilike(f.column, f.value);
                break;
              case 'in':
                query = query.in(f.column, Array.isArray(f.value) ? f.value : [f.value]);
                break;
              case 'is':
                query = query.is(f.column, f.value);
                break;
              case 'is_not':
                query = query.not(f.column, "is", f.value);
                break;
              case 'contains':
                query = query.contains(f.column, f.value);
                break;
              default:
                throw new Error(`Unsupported filter operation: ${f.operation}`);
            }
          });
        } catch (error) {
          console.log('Problem related with filtering option');
          return { data: null, error: new Error('Problem related with filtering option'), success: false };
        }
      }

      const { data: result, error } = await query;
      return { data: result as T, error, success: !error };
    }

    case 'insert': {
      if (!data) {
        console.log('Data is required for insert operation');
        return { data: null, error: new Error('Data is required for insert operation'), success: false };
      }

      const { data: result, error } = await supabase.from(tableName).insert(data).select();
      return { data: result as T, error, success: !error };
    }

    case 'update': {
      if (!data) {
        console.log('Data is required for update operation');
        return { data: null, error: new Error('Data is required for update operation'), success: false };
      }

      if (!primaryKey) {
        console.log('Primary key is required for update operation');
        return { data: null, error: new Error('Primary key is required for update operation'), success: false };
      }

      const { data: result, error } = await supabase
          .from(tableName)
          .update(data)
          .eq(primaryKey.column, primaryKey.value)
          .select();

      return { data: result as T, error, success: !error };
    }

    case 'remove': {
      if (!primaryKey) {
        console.log('Primary key is required for remove operation');
        return { data: null, error: new Error('Primary key is required for remove operation'), success: false };
      }

      const { data: result, error } = await supabase
          .from(tableName)
          .delete()
          .eq(primaryKey.column, primaryKey.value)
          .select();

      return { data: result as T, error, success: !error };
    }

    default:
      console.log(`Mode ${mode} doesn't exist or not implemented`);
      return {
        data: null,
        error: new Error(`Mode ${mode} doesn't exist or not implemented`),
        success: false
      };
  }
}