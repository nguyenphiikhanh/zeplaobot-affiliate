import 'dotenv/config'

export type TargetThreadType = 'user' | 'group'

export const config = {
    port: Number(process.env.PORT || 3000),
    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3309),
        database: process.env.DB_DATABASE || 'zeplaobot',
        username: process.env.DB_USERNAME || 'saffi_user',
        password: process.env.DB_PASSWORD || 'saffi12345',
    },
    shopee: {
        fetchProductApi: process.env.SHOPEE_FETCH_PRODUCT_API || 'https://data.addlivetag.com/product-data/product-data.php',
        affiliateId: process.env.SHOPEE_AFFILIATE_ID || '',
        baseApi: process.env.SHOPEE_BASE_API || 'https://affiliate.shopee.vn/api/v3',
        cookie: process.env.SHOPEE_COOKIE || '',
    },
}



