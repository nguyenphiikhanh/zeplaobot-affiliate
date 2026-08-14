import 'dotenv/config'

export type TargetThreadType = 'user' | 'group'

export const config = {
    appUrl: (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, ''),
    shortLinkBaseUrl: (process.env.SHORT_LINK_BASE_URL || process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, ''),
    port: Number(process.env.PORT || 3000),

    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        database: process.env.DB_DATABASE || 'zeplaobot',
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
    },
    shopee: {
        fetchProductApi: process.env.SHOPEE_FETCH_PRODUCT_API || 'https://data.addlivetag.com/product-data/product-data.php',
        baseApi: process.env.SHOPEE_BASE_API || 'https://affiliate.shopee.vn/api/v3',
        cookie: process.env.SHOPEE_COOKIE || '',
    },
}



