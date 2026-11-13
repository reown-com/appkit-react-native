// Environment variables read by the app and the Playwright tests.
// Declared so they can be read with dot access: Expo only inlines
// `process.env.EXPO_PUBLIC_*` when accessed with dot notation.
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_PROJECT_ID?: string;
    CI?: string;
    BASE_URL?: string;
    WALLET_URL?: string;
    DEFAULT_CHAIN_NAME?: string;
    TIMING_LOGS?: string;
  }
}
