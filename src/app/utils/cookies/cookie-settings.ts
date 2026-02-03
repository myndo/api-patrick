import { config, EnvironmentEnum } from '../../config';

export const cookieSettings = (env: EnvironmentEnum) =>
  env in settingsMap
    ? settingsMap[env ?? EnvironmentEnum.Local]
    : settingsMap[EnvironmentEnum.Local];

const settingsMap: {
  [Key in EnvironmentEnum]: {
    httpOnly: boolean;
    secure: boolean;
    domain?: string;
    sameSite: 'none' | 'lax' | 'strict';
  };
} = {
  [EnvironmentEnum.Local]: {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
  },
  [EnvironmentEnum.Production]: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    domain: config.cookie_access.domain,
  },
  [EnvironmentEnum.Demo]: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    domain: config.cookie_access.domain,
  },
  [EnvironmentEnum.Dev]: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    domain: config.cookie_access.domain,
  },
};
