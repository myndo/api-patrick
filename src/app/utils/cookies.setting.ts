export type Env = 'dev' | 'prod' | 'test';

/** Get the correct cookie settings based on environment */
export const getCookieSettings = (env: string) =>
  env in settingsMap ? settingsMap[(env as Env) ?? 'dev'] : settingsMap.dev;

const settingsMap: {
  [Key in Env]: {
    httpOnly: false;
    secure: boolean;
    domain?: string;
    sameSite: 'none' | 'lax' | 'strict';
  };
} = {
  dev: {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
  },
  prod: {
    httpOnly: false,
    secure: true,
    domain: '.vedcausa.com',
    sameSite: 'strict',
  },
  test: {
    httpOnly: false,
    secure: true,
    domain: '.vedcausa.com',
    sameSite: 'strict',
  },
};
