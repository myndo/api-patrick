import { config } from './../../app/config/index';

const accountSid = config.implementations.twilio.accountSid;
const authToken = config.implementations.twilio.authToken;
const verifySid = config.implementations.twilio.verifySid;

const client = require('twilio')(accountSid, authToken);

export const otpMessageSend = async (options: { phone: string }) => {
  const { phone } = options;
  const otpMessageVoce = await client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phone, channel: 'sms' });

  return otpMessageVoce;
};

export const otpVerifySid = async (options: {
  phone: string;
  code: string;
}) => {
  const { phone, code } = options;
  const otpMessageVoce = await client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: phone, code });

  return otpMessageVoce;
};
