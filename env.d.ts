declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    PASSKEYS_API_KEY: string;
    PASSKEYS_TENANT_ID: string;
    SUPABASE_JWT_SECRET: string;
    DOMAIN: string;
  }
}
