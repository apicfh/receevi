'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase-browser";

export default function ReceivedImageMessageUI({ message }: { message: DBMessage }) {
    const [supabase] = useState(() => createClient())
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    useEffect(() => {
        if (message.media_url) {
            supabase
                .storage
                .from('media')
                .createSignedUrl(message.media_url, 60)
                .then(({ data, error }) => {
                    if (error) throw error
                    setImageUrl(data.signedUrl)
                })
                .catch(e => console.error(e))
        }
    }, [supabase.storage, message.media_url, setImageUrl])
    return (
        <img alt="Image received" className="h-[144px]" src={imageUrl || ''} />
    )
}
