interface D1Database {
  readonly __unusedCompanyRuntimeD1Type?: never;
}

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    COMPANY_GATEWAY_URL?: string;
    COMPANY_GATEWAY_SECRET?: string;
    COMPANY_GATEWAY_PROJECT_ID?: string;
    COMPANY_GATEWAY_COMPANY_KEY?: string;
    [key: string]: unknown;
  };
}
