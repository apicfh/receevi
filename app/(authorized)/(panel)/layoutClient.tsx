'use client';

import React from "react"
import { useSupabase } from "@/components/supabase-provider";
import { useSupabaseUser, useUserRole } from "@/components/supabase-user-provider";
import { Button } from "@/components/ui/button";
import HotelTag from "@/components/ui/tag";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import UserLetterIcon from "@/components/users/UserLetterIcon";
import { ChevronDown, CircleUserRound, ContactIcon, LogOut, MessageCircleIcon, RadioIcon, UserRound, UsersIcon } from "lucide-react";
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState, useMemo } from "react";


// Define types for filter operations
type FilterOperation = 'equal' | 'not_equal' | 'greater_than' | 'less_than' | 'like' | 'ilike' | 'in' | 'is' | 'is_not' | 'contains';

// Define type for filter object
interface FilterOption {
    column: string;
    operation: FilterOperation;
    value: any;
}

// Custom hook for fetching data
function useFetchData(
    tableName: string,
    columns?: string[],
    filter?: FilterOption[]
): { data: string[], error: string | null } {
    const [data, setData] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { query } = useSupabase();

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const result = await query(
                    tableName,
                    'select',
                    columns,
                    filter
                );

                if (!isMounted) return;

                if (result.error) {
                    throw new Error(result.error.message);
                }

                setData(result.data || []);
            } catch (err: any) {
                if (!isMounted) return;
                console.error(`Error fetching ${tableName}:`, err.message);
                setError(err.message);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return { data, error };
}

function useFilteredDropdownData<T>(
    allData: T[],
    selectedFilter: string,
    filterConfig: {
        defaultText: string;
        dataAttribute: string;
        externalData: any;
        extDataAttribute: string;
    }
) {
    // Use memoization to prevent unnecessary re-filtering
    return useMemo(() => {
        console.log("Dati da filtrare:", allData);
        if (selectedFilter === filterConfig.defaultText) {
            return allData;
        } else {
            const extDataId = filterConfig.externalData.find((extItem:any) => extItem[filterConfig.extDataAttribute] === selectedFilter).zone_id;

            console.log("id zona da filtrare:", extDataId);

            const filteringFunction = (item: any, id: any) => {
                return item[filterConfig.dataAttribute] === id;
            }

            const lol = allData.filter(item => filteringFunction(item, extDataId));
            console.log("filtering data:", lol);
            return lol;
        }
    }, [
        selectedFilter,
        allData,
        filterConfig.defaultText,
        filterConfig.externalData
        // We don't include resetStates in dependencies as it shouldn't affect filtering
    ]);
}


export default function PanelClient({ children }: { children: ReactNode }) {
    const activePath = usePathname();
    const { user } = useSupabaseUser();
    const userRole = useUserRole()
    const supabase = useSupabase()
    const { query } = useSupabase()
    const router = useRouter()
    const logout = useCallback(() => {
        supabase.supabase.auth.signOut().then(() => {
            console.log("logout successful")
            router.push('/login')
        }).catch(console.error);
    }, [router, supabase])

    useEffect(() => {
        supabase.supabase.auth.getSession().then(res => {
            if (res.data.session?.access_token) {
                supabase.supabase.realtime.setAuth(res.data.session?.access_token)
            }
        })
    }, [supabase])

    const [selectedHotel, setSelectedHotel] = React.useState("Hotel")
    const [selectedZone, setSelectedZone] = React.useState("Zona Hotel")
    const [selectedOperator, setSelectedOperator] = React.useState("Operatore")

    let { data: allHotelsData } = useFetchData(
        'hotels',
        undefined,
        [
            {
                column: "hotel_name",
                operation: "is_not",
                value: null
            }
        ]
    );

    let { data: allZonesData } = useFetchData(
        'hotel_zones',
        undefined
    );

    console.log(allZonesData)
    console.log("selected:", selectedZone)

    const allOperatorsData = ["Pinco Pallo", "Bello Ciccio"]

    // For filtering hotels based on selected zone
    const filteredHotels = useFilteredDropdownData(
        allHotelsData,
        selectedZone,
        {
            defaultText: "Zona Hotel",
            dataAttribute: "hotel_zone",
            externalData: allZonesData, // Pass zones data directly
            extDataAttribute: "zone_name"
        }
    );

// For filtering operators based on selected hotel
    /*const filteredOperators = useFilteredDropdownData(
        allOperatorsData,
        selectedHotel,
        {
            defaultText: "Hotel",
            externalData: filteredHotels,
            extDataAttribute: "hotel_name"
        }
    );*/

    const filteredOperators = allOperatorsData;

    return (
        <div id="page_container" className="flex flex-col h-screen">
            {/*Screen container*/}
            <div id="header" className="bg-primary-strong h-16 flex flex-row justify-between px-4 flex-shrink-0">
                {/*Header container*/}
                <div id="user_options" className="flex flex-row items-center">
                    {/*User container*/}
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                {/* <CircleUserRound size={32} className="cursor-pointer" /> */}
                                <button>
                                    <UserLetterIcon user={{
                                        firstName: user?.user_metadata.first_name,
                                        lastName: user?.user_metadata.last_name
                                    }} className="cursor-pointer h-10 w-10"/>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.user_metadata.first_name} {user?.user_metadata.last_name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4"/>
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <div>{user?.user_metadata.full_name}</div>
                        {/* <div>{user?.email}</div> */}
                    </div>
                </div>
                {/* <div className="flex flex-row"> */}
                <div id="nav_options" className="flex flex-row items-center">
                    {/*Nav container*/}
                    <Link href="/chats"><Button variant={activePath?.startsWith('/chats') ? "secondary" : "ghost"}
                                                className="px-4 justify-start mr-2 hover:!text-black" style={!activePath?.startsWith('/chats') ? { color: "white" } : {}}>
                        <MessageCircleIcon/>&nbsp;&nbsp;Chats</Button></Link>
                    <Link href="/contacts"><Button variant={activePath?.startsWith('/contacts') ? "secondary" : "ghost"}
                                                   className="px-4 justify-start ml-2 hover:!text-black" style={!activePath?.startsWith('/contacts') ? { color: "white" } : {}}><ContactIcon/>&nbsp;&nbsp;Contacts</Button></Link>
                    {(() => {
                        if (userRole === 'admin') {
                            return (
                                <>
                                    <Link href="/bulk-send"><Button
                                        variant={activePath?.startsWith('/bulk-send') ? "secondary" : "ghost"}
                                        className="px-4 justify-start ml-2"> <RadioIcon/>&nbsp;&nbsp;Bulk Send</Button></Link>
                                    <Link href="/users"><Button
                                        variant={activePath?.startsWith('/users') ? "secondary" : "ghost"}
                                        className="px-4 justify-start ml-2">
                                        <UsersIcon/>&nbsp;&nbsp;Users</Button></Link>
                                </>
                            )
                        }
                    })()}
                </div>
                <div id="filter_list" className="flex flex-row items-center gap-4">
                    <div id="hotelZone_filter">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="bg-secondary text-black px-4 py-2 rounded flex items-center justify-between min-w-32">
                                <span>{selectedZone}</span>
                                <ChevronDown className="h-4 w-4 ml-2"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {allZonesData.map((zone) => (
                                    <DropdownMenuItem
                                        key={zone["zone_name"]}
                                        onClick={() => setSelectedZone(zone["zone_name"])}
                                    >
                                        {zone["zone_name"]}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div id="hotel_filter">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                disabled={selectedZone === "Zona Hotel"}
                                className="bg-secondary text-black px-4 py-2 rounded flex items-center justify-between min-w-32 disabled:bg-gray-400 disabled:text-gray-800">
                                <span>{selectedHotel}</span>
                                <ChevronDown className="h-4 w-4 ml-2"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {filteredHotels.map((hotel) => (
                                    <DropdownMenuItem
                                        key={hotel["hotel_name"]}
                                        onClick={() => setSelectedHotel(hotel["hotel_name"])}
                                    >
                                        {hotel["hotel_name"]}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div id="operator_filter">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                disabled={selectedHotel === "Hotel"}
                                className="disabled bg-secondary text-black px-4 py-2 rounded flex items-center justify-between min-w-32 disabled:bg-gray-400 disabled:text-gray-800">
                                <span>{selectedOperator}</span>
                                <ChevronDown className="h-4 w-4 ml-2"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {filteredOperators.map((operator) => (
                                    <DropdownMenuItem
                                        key={operator}
                                        onClick={() => setSelectedOperator(operator)}
                                    >
                                        {operator}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div id="logo_container" className="flex flex-row">
                    {/*Logo container*/}
                    <div className="flex flex-row gap-2 items-center">
                        <img src="/assets/img/icon.svg" className="w-8 h-8"/>
                        <div className="text-white text-lg">Receevi</div>
                    </div>
                </div>
                {/* </div> */}
                {/* </div> */}
            </div>
            {/* <div className="flex-[6] max-w-xs border-e-2 border-e-slate-100 p-4">
                <div className="text-white text-center">Receevi</div>
                <div className="mt-8">
                </div>
            </div> */}
            <div className="h-full overflow-y-auto bg-gray-100 flex-grow">
                {children}
            </div>
        </div>
    )
}
