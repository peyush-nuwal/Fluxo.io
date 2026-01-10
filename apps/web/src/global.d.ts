// CSS side-effect imports
declare module "*.css";

// Static assets (optional)
declare module "*.png";
declare module "*.svg";

// Env typing
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
  }
}
