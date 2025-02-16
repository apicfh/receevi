export type Hotel = {
    hotel_id: number,
    hotel_name: string | null,
    hotel_zone: number,
    template_preventivo_name: string | null
}

export type HotelZone = {
    zone_id: number,
    zone_name: string | null,
    whatsapp_number_id: string,
    whatsapp_account_id: string
}
