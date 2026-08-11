import 'dotenv/config'
export type TargetThreadType = 'user' | 'group'

function required(name: string, value: string | undefined): string {
    if (!value?.trim()) throw new Error(`Missing environment variable: ${name}`)
    return value.trim()
}

export const config = {
    port: Number(process.env.PORT || 3000),
    apiKey: required('API_KEY', process.env.API_KEY),
    baseApi: (process.env.BASE_API_URL ?? ''),
}
