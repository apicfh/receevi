import { useSupabase } from "@/components/supabase-provider";
import { DBTables } from "@/lib/enums/Tables";
import { HotelZone } from "@/types/hotel";
import { useCallback, useEffect, useRef, useState } from "react";


export function getHotelsZone()
{   
    const [hotelsZones, setHotelsZones] = useState<HotelZone[]>([]);
    const { supabase } = useSupabase()

    const getHotelsZones = useCallback(async () => {
        let query = supabase
                .from(DBTables.HotelZones)
                .select('*')
            
            const { data, error } = await query
            if (error) {
                throw error
            }
            setHotelsZones(data);
        }, [supabase])

        useEffect(()=>{
            getHotelsZones();
        },[])
    return [hotelsZones] as const;
}