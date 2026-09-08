const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export const HOST = {
    backend: BACKEND_URL,
    api: `${BACKEND_URL}/api/v1`,
};
