type ImportMetaEnvLike = {
  VITE_API_URL?: string;
  PROD?: boolean;
};

const env = (import.meta as ImportMeta & { env?: ImportMetaEnvLike }).env;

export const API_BASE_URL =
  env?.VITE_API_URL
    ? env.VITE_API_URL
    : env?.PROD
      ? "https://api.itamoving.com.br"
      : "http://localhost:30100";
