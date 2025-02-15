export type Hotel = {
    hotel_id: number,
    hotel_name: string,
    hotel_zone: number
}

export type HotelZone = {
    zone_id: number,
    zone_name: string | null,
    whatsapp_number_id: string | null,
    whatsapp_account_id: string | null
}
