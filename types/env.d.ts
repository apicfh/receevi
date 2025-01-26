declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET_KEY: string;
            FACEBOOK_APP_SECRET: string;
            WHATSAPP_ACCESS_TOKEN: string;
            NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
            NEXT_PUBLIC_SUPABASE_URL: string;
            SUPABASE_SERVICE_ROLE: string;
            WEBHOOK_VERIFY_TOKEN: string;
            WHATSAPP_API_PHONE_NUMBER_ID: string;
            WHATSAPP_BUSINESS_ACCOUNT_ID: string;
            WHATSAPP_CONFIGS: string;
        }
    }

// Create a proxy around process.env to handle dynamic parsing
const dynamicEnv = new Proxy(process.env, {
    get(target, prop: string) {
        switch (prop) {
            case value:'WHATSAPP_API_PHONE_NUMBER_ID'
            case value:'WHATSAPP_BUSINESS_ACCOUNT_ID'
                const parsedJson = JSON.parse(target.WHATSAPP_CONFIGS)
                return parsedJson[runtimeConfig.getAccountId()][prop];
            default:
                // Default behavior for other environment variables
                return target[prop];
        }
    }
});

class RuntimeConfig {
    private currentAccountId: string | null = null;

    setAccountId(accountId: string | null = null) {
        this.currentAccountId = accountId;
    }

    getAccountId(): string {
        if (!this.currentAccountId) {
            throw new Error('Current account ID is not set');
        }
        return this.currentAccountId;
    }
}
const runtimeConfig = new RuntimeConfig();
}

export {}