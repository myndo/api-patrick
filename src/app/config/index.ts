import * as dotenv from 'dotenv';
dotenv.config();

export enum EnvironmentEnum {
  Local = 'local',
  Production = 'production',
  Dev = 'dev',
  Demo = 'demo',
}

export const config = {
  /**
   * Url site
   */
  url: {
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    client: process.env.NODE_CLIENT_URL,
    dashboard: process.env.NODE_DASHBOARD_URL,
  },
  /**
   * Node environment
   */
  environment:
    (process.env.NODE_ENV as EnvironmentEnum) || EnvironmentEnum.Local,
  /**
   * Cookie configuration
   */
  cookieKey: process.env.COOKIE_KEY || '@3%NE8IksyHK4yC5POFurDCAVW@FqxBe',
  cookie_access: {
    domain: '.vedcausa.com',
    jwtUser: process.env.COOKIE_JWT_USER || 'jwt-access-user',
    nameLogin: process.env.COOKIE_NAME_LOGIN || 'x-user',
    accessExpire: process.env.COOKIE_ACCESS_EXPIRE || '32000000000', //32000000000 10000000000
    jwtVerify: process.env.COOKIE_JWT_USER || 'jwt-access-verify',
    nameVerify: process.env.COOKIE_NAME_VERIFY || 'x-verify',
    verifyExpire: process.env.COOKIE_VERIFY_EXPIRE || '1800000', // 30 minutes
  },

  /**
   * Api
   */
  api: {
    prefix: '/api',
    version: process.env.API_VERSION,
    headerSecretKey: process.env.HEADER_API_SECRET_KEY,
  },
  /**
   * Server port
   */
  port: process.env.PORT || 5500,
  /**
   * Database
   */
  database: {
    url: process.env.DATABASE_URL,
  },
  /**
   * Show or not console.log
   */
  showLog: true,
};
