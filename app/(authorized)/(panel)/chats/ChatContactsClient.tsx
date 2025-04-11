'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LoaderCircleIcon, Search, Menu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ContactUI from "./ContactUI";
import { useContactList } from "./useContactList";
import { useSelectedContacts, useSelectedContactsDispatch } from "./SelectedContactsContext";
import {useSearchParams} from "next/navigation";

export default function ChatContactsClient() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [active, setActive] = useState<boolean>(true);
    const searchParams = useSearchParams();
    const [contacts, loadMore, isLoading] = useContactList('', active);
    const selectedContacts = useSelectedContacts();
    const dispatch = useSelectedContactsDispatch();
    const chatListRef = useRef<HTMLDivElement>(null);

    const onDivScroll = useCallback(async (event: React.UIEvent<HTMLDivElement>) => {
        const current = chatListRef.current;
        if (current) {
            const isAtBottom = (current.scrollHeight - current.scrollTop) - 500 <= current.clientHeight;

            if (isAtBottom) {
                await loadMore();
            }
        }
    }, [loadMore, chatListRef]);

    const onTabChange = useCallback((value: string) => {
        setActive(value === 'active')
    }, [setActive]);

    const handleCheckboxChange = useCallback((contactId: number, checked: boolean) => {
        if (checked) {
            // Add contact if not already selected and limit is not reached
            if (!selectedContacts.includes(contactId) && selectedContacts.length < 3) {
                dispatch({ type: 'ADD_CONTACT', contactId });
            }
        } else {
            // Remove contact
            dispatch({ type: 'REMOVE_CONTACT', contactId });
        }
    }, [selectedContacts, dispatch]);

    // Effect to sync with URL params on initial load
    useEffect(() => {
        const chatsParam = searchParams.get('chats');
        const chatParams = searchParams.getAll('chat');

        let ids: number[] = [];

        if (chatsParam) {
            ids = chatsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)).slice(0, 3);
        } else if (chatParams.length > 0) {
            ids = chatParams.map(id => parseInt(id)).filter(id => !isNaN(id)).slice(0, 3);
        }

        if (ids.length > 0) {
            dispatch({ type: 'SET_CONTACTS', contacts: ids });
        }
    }, []);

    // Rest of the component remains mostly the same...
    return (
        <div className="h-full flex flex-col gap-2">
            <Input
                type="text"
                placeholder="Cerca"
                leftIcon={<Menu size={24} className="text-gray-600"/>}
                rightIcon={<Search size={20} className="text-gray-500"/>}
                className="h-10 py-2 text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
                classNameParent="px-2 pt-2"
            />
            <Tabs defaultValue="active" className="px-2 pt-2" onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Only render the selection counter after client-side hydration */}
            {isClient && selectedContacts.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 text-blue-700 flex justify-between items-center">
                    <span>Selezionati: {selectedContacts.length}/3</span>
                    <button
                        className="text-xs text-blue-700 hover:underline"
                        onClick={() => dispatch({type: 'CLEAR_CONTACTS'})}
                    >
                        Cancella selezionati
                    </button>
                </div>
            )}

            <div className="flex flex-col h-full overflow-y-auto" ref={chatListRef} onScroll={onDivScroll}>
                {isClient && contacts.length > 0 && contacts.map(contact => {
                    return <ContactUI
                        key={contact.wa_id}
                        onCheckboxChange={handleCheckboxChange}
                        contact={contact}
                        isChecked={selectedContacts.includes(contact.wa_id)}
                    />
                })}

                {/* Only render the empty state message after client-side hydration */}
                {isClient && contacts.length === 0 && (
                    <div className="p-4 text-center">
                        {active ? (
                            <>No active chats at the moment. You&apos;ll see contacts here with an open chat window.</>
                        ) : (
                            <>No inactive chats. Contacts whose chat window has expired will appear here.</>
                        )}
                    </div>
                )}

                {isLoading && (
                    <div className="w-full flex justify-center items-center py-4">
                        <LoaderCircleIcon className="animate-spin"/>
                    </div>
                )}
            </div>
        </div>
    );
}