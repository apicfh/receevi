import { HotelZone } from "./hotel";

class RuntimeConfig {
    
    private hotel_zone : HotelZone |  undefined;

    setSelectedZone(hotelZone : HotelZone)
    {
        console.log("set zone: " + hotelZone.zone_id)
        this.hotel_zone = hotelZone
    }

    getSelectedZone() : HotelZone | undefined
    {
        if (this.hotel_zone != undefined){
            console.log("get zone: " + this.hotel_zone.zone_id)
        }
        else{
            console.log("get zone: " + this.hotel_zone)
        }
        
        return this.hotel_zone;
    }
}

const globalForRuntimeConfig = global as any;

if (!globalForRuntimeConfig.runtimeConfig) {
    globalForRuntimeConfig.runtimeConfig = new RuntimeConfig();
}

export const runtimeConfig: RuntimeConfig = globalForRuntimeConfig.runtimeConfig;