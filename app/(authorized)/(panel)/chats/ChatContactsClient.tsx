'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircleIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ContactUI from "./ContactUI";
import { useContactList } from "./useContactList";
import { Label } from "@/components/ui/label";
import { getHotelsZone } from "./HotelZones";
import { runtimeConfig } from "@/types/runtimeConfig";

export default function ChatContactsClient() {
    const [active, setActive] = useState<boolean>(true)
    const [hotelsZones] = getHotelsZone()
    //const [selectedHotelZoneId, setSelectedHotelZoneId] = useState<number | undefined>();
    const [contacts, loadMore, isLoading] = useContactList('', active)
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
    }, [setActive])

    const onHotelZoneChange = useCallback((hotelZoneId: number) => {
        //setSelectedHotelZoneId(hotelZoneId);
        runtimeConfig.setSelectedZone(hotelsZones[hotelZoneId])
    }, []);

    // Set default hotel zone when hotelsZones are fetched
    useEffect(() => {
        if (hotelsZones.length > 0)// && selectedHotelZoneId === undefined) 
        {
            // console.log("default selected: " + hotelsZones[1].zone_id)
            // setSelectedHotelZoneId(hotelsZones[0].zone_id);
            runtimeConfig.setSelectedZone(hotelsZones[0])
        }
    }, [hotelsZones]);

    return (
        <div className="h-full flex flex-col gap-2">
            <div className="mb-4">
                <Label htmlFor="zone">Select Hotel Zone:</Label>
                <select
                    id="zone"
                    name="zone"
                    value={runtimeConfig.getSelectedZone()?.zone_id}
                    onChange={(e) => onHotelZoneChange(Number(e.target.value))}
                    required
                    className="w-full border rounded-lg p-2 mt-1"
                >
                    {hotelsZones.length > 0 ? (
                        hotelsZones.map((hotel) => (
                            <option key={hotel.zone_id} value={hotel.zone_id}>
                                {hotel.zone_id + " - " + hotel.zone_name}
                            </option>
                        ))
                    ) : (
                        <option value="">Loading...</option>
                    )}
                </select>
            </div>
            <Tabs defaultValue="active" className="px-2 pt-2" onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
            </Tabs>
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
