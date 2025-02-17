'use client'

import { useSupabase } from "@/components/supabase-provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircleIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ContactUI from "./ContactUI";
import { useContactList } from "./useContactList";

export default function ChatContactsClient() {

    const { supabase } = useSupabase()

    const [active, setActive] = useState<boolean>(true)

    const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
    const [zones, setZones] = useState<{ zone_id: number, zone_name: string | null }[]>([]);

    const [contacts, loadMore, isLoading] = useContactList('', active, selectedZoneId)
    const chatListRef = useRef<HTMLDivElement>(null);

    // Fetch hotel zones from database
    useEffect(() => {
        async function fetchZones() {
            const { data, error } = await supabase
                .from('hotel_zones') // Replace with your actual table name
                .select('zone_id, zone_name');

            if (error) {
                console.error('Error fetching zones:', error);
            } else {
                setZones(data);
                if (data.length > 0) {
                    setSelectedZoneId(data[0].zone_id); // Set default selection to the first zone
                }
            }
        }
        fetchZones();
    }, []);

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
    }, [setActive])

    return (
        <div className="h-full flex flex-col gap-2">
            <Tabs defaultValue="active" className="px-2 pt-2" onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Hotel Zone Selector */}
            <div className="px-4">
                <label htmlFor="hotel-zone" className="block text-sm font-medium text-gray-700">
                    Select Hotel Zone
                </label>
                <select
                    id="hotel-zone"
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    value={selectedZoneId ?? ""}
                    onChange={(e) => setSelectedZoneId(Number(e.target.value))}
                >
                    {zones.map(zone => (
                        <option key={zone.zone_id} value={zone.zone_id}>
                            {zone.zone_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col h-full overflow-y-auto" ref={chatListRef} onScroll={onDivScroll}>
                {contacts.length > 0 && contacts.map(contact => {
                    return <ContactUI key={contact.wa_id} contact={contact} />
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
