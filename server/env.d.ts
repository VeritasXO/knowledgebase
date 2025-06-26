declare namespace NodeJS {
  interface ProcessEnv {
    APP_URL: string;
    APP_PORT: string;
    APP_NAME: string;
    DATABASE_USER: string;
    DATABASE_PASS: string;
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_NAME: string;

    /** Secret used to sign sessions / JWTs */
    SESSION_SECRET: string;

    /** Fallback email for testing change-email flows */
    TEST_RECIPIENT_CHANGE_EMAIL: string;

    /** Google OAuth client credentials */
    GOOGLE_OAUTH_CLIENT_ID: string;
    GOOGLE_OAUTH_CLIENT_SECRET: string;

    NODE_ENV: "development" | "production";

    /** Allow any other env vars without complaints */
    [key: string]: string | undefined;
  }
}
