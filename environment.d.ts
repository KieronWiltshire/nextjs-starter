namespace NodeJS {
    interface ProcessEnv {
        APP_URL: string;
        APP_SECRET: string;

        API_URL: string;

        WORKOS_CLIENT_ID: string;
        WORKOS_API_KEY: string;
        WORKOS_WEBHOOK_SECRET: string;

        PLUNK_API_KEY: string;

        NEXT_PUBLIC_WORKOS_REDIRECT_URI: string;
    }
}