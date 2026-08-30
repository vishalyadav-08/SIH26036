const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const HOST = {
    backend: BACKEND_URL,
    api: `${BACKEND_URL}/api/v1`,
}
