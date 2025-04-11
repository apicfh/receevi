'use client'

import { useSearchParams } from 'next/navigation';
import ContactChat from './[wa_id]/page';
import { useEffect, useState } from 'react';
import { CircleAlertIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelectedContacts, useSelectedContactsDispatch } from "./SelectedContactsContext";

export default function MultiChatPage() {
    const searchParams = useSearchParams();
    const selectedContacts = useSelectedContacts();
    const dispatch = useSelectedContactsDispatch();
    const [isClient, setIsClient] = useState(false);

    // Add isClient state to handle hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Effect to sync URL with selected contacts
    useEffect(() => {
        // Handle both formats: ?chats=id1,id2,id3 and ?chat=id1&chat=id2
        const chatsParam = searchParams.get('chats');
        const chatParams = searchParams.getAll('chat');

        let ids: number[] = [];

        if (chatsParam) {
            // Handle comma-separated list
            ids = chatsParam.split(',')
                .map(id => parseInt(id))
                .filter(id => !isNaN(id))
                .slice(0, 3);
        } else if (chatParams.length > 0) {
            // Handle multiple chat parameters
            ids = chatParams
                .map(id => parseInt(id))
                .filter(id => !isNaN(id))
                .slice(0, 3);
        }

        // If we have IDs from URL, update the context
        if (ids.length > 0) {
            dispatch({ type: 'SET_CONTACTS', contacts: ids });
        }
    }, [searchParams, dispatch]);

    // Rest of your functions...
    const updateUrlWithoutNavigation = (contacts: number[]) => {
        const url = new URL(window.location.href);
        url.searchParams.set('chats', contacts.join(','));
        window.history.pushState({}, '', url.toString());
    };

    const handleViewSelected = () => {
        if (selectedContacts.length > 0) {
            updateUrlWithoutNavigation(selectedContacts);
        }
    };

    const handleRemoveContact = (contactId: number) => {
        dispatch({ type: 'REMOVE_CONTACT', contactId });

        setTimeout(() => {
            const event = new CustomEvent('removeSelectedContact', {
                detail: { contactId: contactId.toString() }
            });
            window.dispatchEvent(event);
        }, 0);
    };

    useEffect(() => {
        const handleSelectedContactsChanged = (event: CustomEvent) => {
            const { selectedContacts: contacts, changedContactId, wasAdded, clearAllDisplayed } = event.detail;

            if (clearAllDisplayed) {
                dispatch({ type: 'CLEAR_CONTACTS' });
                updateUrlWithoutNavigation([]);
                return;
            }

            if (changedContactId) {
                const contactId = parseInt(changedContactId);
                if (wasAdded && selectedContacts.length < 3) {
                    if (!selectedContacts.includes(contactId)) {
                        dispatch({ type: 'ADD_CONTACT', contactId });
                        updateUrlWithoutNavigation(selectedContacts);
                    }
                } else if (!wasAdded) {
                    dispatch({ type: 'REMOVE_CONTACT', contactId });
                    updateUrlWithoutNavigation(selectedContacts);
                }
            }
        };

        window.addEventListener('selectedContactsChanged',
            handleSelectedContactsChanged as EventListener);

        return () => {
            window.removeEventListener('selectedContactsChanged',
                handleSelectedContactsChanged as EventListener);
        };
    }, [selectedContacts, dispatch]);

    // Unified rendering approach with client-side only conditional content
    return (
        <div className="flex flex-col h-full w-full">
            {!isClient ? (
                // Static loading state for server-side rendering
                <div className="flex flex-col justify-center items-center h-full w-full gap-2">
                    <div className="text-lg">Loading...</div>
                </div>
            ) : (
                // Client-side only rendered content
                <>
                    {selectedContacts.length > 0 && (
                        <>
                            {/* Multi-chat view */}
                            <div className="flex justify-between items-center p-2 border-b border-gray-200">
                                <div className="font-semibold">
                                    Chat attive: {selectedContacts.length}/3
                                </div>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                {selectedContacts.map((waId) => (
                                    <div
                                        key={waId}
                                        className={`relative ${selectedContacts.length > 1 ? 'flex-1' : 'w-full'} h-full flex-shrink-0 overflow-hidden border-r last:border-r-0 border-gray-200`}
                                    >
                                        <ContactChat params={{ wa_id: waId.toString() }} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {selectedContacts.length === 0 && (
                        // No contacts selected
                        <div className="flex flex-col justify-center items-center h-full w-full gap-2">
                            <CircleAlertIcon />
                            <div className="text-lg">Nessun contatto selezionato</div>
                            <div className="text-sm text-gray-500">Seleziona un contatto dalla barra laterale</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}