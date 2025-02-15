import { runtimeConfig } from "./runtimeConfig";

// Create a proxy around process.env to handle dynamic parsing
const dynamicEnv = new Proxy(process.env, {
    get(target, prop: string)
    {
        switch (prop) 
        {
            case 'WHATSAPP_API_PHONE_NUMBER_ID':
                return runtimeConfig.getSelectedZone()?.whatsapp_number_id;
            case 'WHATSAPP_BUSINESS_ACCOUNT_ID':
                return runtimeConfig.getSelectedZone()?.whatsapp_account_id;
            default:
                // Default behavior for other environment variables
                return runtimeConfig.getSelectedZone()?.zone_id;
        }
    }
});

export {dynamicEnv};