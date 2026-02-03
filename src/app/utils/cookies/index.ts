import { config } from '../../config';
import { cookieSettings } from './cookie-settings';
const cookieSetting = cookieSettings(config?.environment);

/*************** Setting user cookie *************************/
export const validation_verify_cookie_setting = {
  maxAge: Number(config.cookie_access.verifyExpire),
  ...cookieSetting,
};

export const validation_login_cookie_setting = {
  maxAge: Number(config.cookie_access.accessExpire),
  ...cookieSetting,
};

export const webhooks_stripe_cookie_setting = {
  maxAge: Number(config.cookie_access.accessExpire),
  ...cookieSetting,
};
