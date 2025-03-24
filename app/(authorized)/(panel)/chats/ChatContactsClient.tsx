'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LoaderCircleIcon, Search, Menu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ContactUI from "./ContactUI";
import { useContactList } from "./useContactList";

export default function ChatContactsClient() {
    const [active, setActive] = useState<boolean>(true);
    const [contacts, loadMore, isLoading] = useContactList('', active);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
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
        setSelectedContacts(prev => {
            console.log(contactId);
            let newSelected;
            if (checked) {
                // Only add if not already selected and limit to 3
                if (!prev.includes(contactId) && prev.length < 3) {
                    newSelected = [...prev, contactId];
                } else {
                    newSelected = prev;
                }
            } else {
                newSelected = prev.filter(id => id !== contactId);
            }

            // Broadcast the change
            const event = new CustomEvent('selectedContactsChanged', {
                detail: { selectedContacts: newSelected }
            });
            window.dispatchEvent(event);

            return newSelected;
        });
    }, []);

    // Listen for remove events from the MultiChatPage
    useEffect(() => {
        const handleRemoveContact = (event: CustomEvent) => {
            const { contactId } = event.detail;
            setSelectedContacts(prev => {
                const newSelected = prev.filter(id => id !== contactId);

                // Broadcast the change
                const updateEvent = new CustomEvent('selectedContactsChanged', {
                    detail: { selectedContacts: newSelected }
                });
                window.dispatchEvent(updateEvent);

                return newSelected;
            });
        };

        window.addEventListener('removeSelectedContact',
            handleRemoveContact as EventListener);

        return () => {
            window.removeEventListener('removeSelectedContact',
                handleRemoveContact as EventListener);
        };
    }, []);

    return (
        <div className="h-full flex flex-col gap-2">
            <Input
                type="text"
                placeholder="Cerca"
                leftIcon={<Menu size={24} className="text-gray-600" />}
                rightIcon={<Search size={20} className="text-gray-500" />}
                className="h-10 py-2 text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
                classNameParent="px-2 pt-2"
            />
            <Tabs defaultValue="active" className="px-2 pt-2" onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
            </Tabs>
            {selectedContacts.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 text-blue-700 flex justify-between items-center">
                    <span>Selezionati: {selectedContacts.length}/3</span>
                    <button
                        className="text-xs text-blue-700 hover:underline"
                        onClick={() => {
                            setSelectedContacts([]);
                            // Broadcast the change
                            const event = new CustomEvent('selectedContactsChanged', {
                                detail: { selectedContacts: [] }
                            });
                            window.dispatchEvent(event);
                        }}
                    >
                        Cancella
                    </button>
                </div>
            )}
            <div className="flex flex-col h-full overflow-y-auto" ref={chatListRef} onScroll={onDivScroll}>
                {contacts.length > 0 && contacts.map(contact => {
                    return (
                        <ContactUI
                            key={contact.wa_id}
                            contact={contact}
                            onCheckboxChange={handleCheckboxChange}
                            isChecked={selectedContacts.includes(contact.wa_id)}
                        />
                    )
                })}
                {contacts.length === 0 && (
                    <div className="p-4 text-center">
                        {(() => {
                            if (active) {
                                return <>
                                    No active chats at the moment. You&apos;ll see contacts here with an open chat window.
                                </>
                            } else {
                                return <>
                                    No inactive chats. Contacts whose chat window has expired will appear here.
                                </>
                            }
                        })()}
                    </div>
                )}
                {isLoading && (
                    <div className="w-full flex justify-center items-center py-4">
                        <LoaderCircleIcon className="animate-spin" />
                    </div>
                )}
            </div>
        </div>
    )
}