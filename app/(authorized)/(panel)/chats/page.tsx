'use client'

import { useSearchParams, useRouter } from 'next/navigation';
import ContactChat from './[wa_id]/page';
import { useState, useEffect, useRef } from 'react';
import { CircleAlertIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MultiChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [chatIds, setChatIds] = useState<string[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const pendingContactUpdate = useRef<string[] | null>(null);

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
        // Also update selected contacts to match URL on initial load
        setSelectedContacts(ids);

        // Hide contact resume when showing multiple chats
        if (ids.length > 1) {
            const contactResumeContainer = document.getElementById('contact-resume-container');
            if (contactResumeContainer) {
                contactResumeContainer.style.display = 'none';
            }
        }
    }, [searchParams]);

    // Listen for selected contacts from the sidebar
    useEffect(() => {
        const handleSelectedContactsChanged = (event: CustomEvent) => {
            const { selectedContacts: contacts, changedContactId, wasAdded } = event.detail;
            pendingContactUpdate.current = contacts;

            // Schedule state update for the next tick
            setTimeout(() => {
                if (pendingContactUpdate.current !== null) {
                    setSelectedContacts(pendingContactUpdate.current);

                    // If the changed contact is specified, handle addition or removal
                    if (changedContactId) {
                        if (wasAdded && chatIds.length < 3) {
                            // Add the contact to active chats if not already there
                            if (!chatIds.includes(changedContactId)) {
                                const updatedChatIds = [...chatIds, changedContactId].slice(0, 3);
                                setChatIds(updatedChatIds);
                                updateUrlWithoutNavigation(updatedChatIds);
                            }
                        } else if (!wasAdded) {
                            // Remove the contact from active chats
                            const updatedChatIds = chatIds.filter(id => id !== changedContactId);
                            setChatIds(updatedChatIds);
                            updateUrlWithoutNavigation(updatedChatIds);
                        }
                    } else {
                        // Just add any new contacts if space is available
                        if (chatIds.length < 3) {
                            // Find contacts that aren't already displayed
                            const newContacts = pendingContactUpdate.current.filter(
                                id => !chatIds.includes(id)
                            );

                            if (newContacts.length > 0) {
                                // Add new contacts up to the limit of 3
                                const updatedChatIds = [...chatIds, ...newContacts].slice(0, 3);
                                setChatIds(updatedChatIds);
                                updateUrlWithoutNavigation(updatedChatIds);
                            }
                        }
                    }

                    pendingContactUpdate.current = null;
                }
            }, 0);
        };

        window.addEventListener('selectedContactsChanged',
            handleSelectedContactsChanged as EventListener);

        return () => {
            window.removeEventListener('selectedContactsChanged',
                handleSelectedContactsChanged as EventListener);
        };
    }, [chatIds]);

    // Navigate to the multi-chat view
    const handleViewSelected = () => {
        if (selectedContacts.length > 0) {
            // Update chatIds directly instead of changing URL
            setChatIds(selectedContacts);
            // Optionally update URL without navigation
            updateUrlWithoutNavigation(selectedContacts);
        }
    };

    // Update URL without causing navigation/page refresh
    const updateUrlWithoutNavigation = (contacts: string[]) => {
        const url = new URL(window.location.href);
        url.searchParams.set('chats', contacts.join(','));
        window.history.pushState({}, '', url.toString());
    };

    // Remove a contact from selection
    const handleRemoveContact = (contactId: string) => {
        // Update local state
        setSelectedContacts(prev => prev.filter(id => id !== contactId));

        // Schedule event dispatch in the next tick to avoid render-phase issues
        setTimeout(() => {
            // Send event to update sidebar
            const event = new CustomEvent('removeSelectedContact', {
                detail: { contactId }
            });
            window.dispatchEvent(event);
        }, 0);
    };

    // If we have URL parameters, show the multi-chat view
    if (chatIds.length > 0) {
        return (
            <div className="flex flex-col h-full w-full">
                {/* Header bar with counter */}
                <div className="flex justify-between items-center p-2 border-b border-gray-200">
                    <div className="font-semibold">
                        Chat attive: {chatIds.length}/3
                    </div>
                </div>

                {/* Chat panels */}
                <div className="flex flex-1 overflow-hidden">
                    {chatIds.map((waId) => (
                        <div
                            key={waId}
                            className={`relative ${chatIds.length > 1 ? 'flex-1' : 'w-full'} h-full flex-shrink-0 overflow-hidden border-r last:border-r-0 border-gray-200`}
                        >
                            <ContactChat params={{ wa_id: waId }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // If we have selected contacts but not in URL yet, show the contacts list with button
    if (selectedContacts.length > 0) {
        return (
            <div className="flex flex-col h-full w-full">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Contatti selezionati ({selectedContacts.length}/3)</h2>
                </div>
                <div className="flex-1 overflow-auto">
                    <div className="flex flex-col gap-2 p-4">
                        {selectedContacts.map(contactId => (
                            <div key={contactId} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <span>+{contactId}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveContact(contactId)}
                                >
                                    <X size={16} className="mr-1" />
                                    Rimuovi
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleViewSelected}
                    >
                        Visualizza chat selezionate
                    </Button>
                </div>
            </div>
        );
    }

    // No contacts selected and no chats in URL
    return (
        <div className="flex flex-col justify-center items-center h-full w-full gap-2">
            <CircleAlertIcon />
            <span className="text-lg">Nessun contatto selezionato</span>
            <span className="text-sm text-gray-500">Seleziona un contatto dalla barra laterale</span>
        </div>
    );
}