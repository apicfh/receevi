'use client'

import { useSearchParams } from 'next/navigation';
import ContactChat from './[wa_id]/page';
import { useState, useEffect } from 'react';
import { CircleAlertIcon } from "lucide-react";

export default function MultiChatPage() {
    const searchParams = useSearchParams();
    const [chatIds, setChatIds] = useState<string[]>([]);

    useEffect(() => {
        // Handle both formats: ?chats=id1,id2,id3 and ?chat=id1&chat=id2
        const chatsParam = searchParams.get('chats');
        const chatParams = searchParams.getAll('chat');

        let ids: string[] = [];

        if (chatsParam) {
            // Handle comma-separated list
            ids = chatsParam.split(',').filter(id => id.trim() !== '').slice(0, 3);
        } else if (chatParams.length > 0) {
            // Handle multiple chat parameters
            ids = chatParams.filter(id => id.trim() !== '').slice(0, 3);
        }

        setChatIds(ids);
    }, [searchParams]);

    if (chatIds.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-full w-full gap-2">
                <CircleAlertIcon />
                <span className="text-lg">Nessun contatto selezionato</span>
                <span className="text-sm text-gray-500">Seleziona un contatto dalla barra laterale</span>
            </div>
        );
    }

    return (
        <>
            {
                chatIds.map((waId, index) => (
                <div
                    key={waId}
                    className={`${chatIds.length > 1 ? 'flex-1' : 'w-full'} h-full flex-shrink-0 overflow-hidden border-r last:border-r-0 border-gray-200`}
                >
                    <ContactChat params={{ wa_id: waId }} />
                </div>
            ))
            }
        </>
    );
}