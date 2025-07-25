/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />


interface ImportMetaEnv {
    readonly VITE_BASEURL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }