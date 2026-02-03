import { createTransport } from 'nodemailer';
import { config, EnvironmentEnum } from '../../app/config/index';

import { Resend } from 'resend';
const resend = new Resend(config.implementations.resendSMTP.apiKey);

export type EmailMessage = {
  from: string;
  to: string[];
  subject: string;
  replyTo?: string;
  html?: string;
  text: string;
  attachments?: any[];
};
export const nodeMailServiceAdapter = async (options: {
  description?: string;
  from: string;
  html: string;
  subject: string;
  to: string[];
  attachments?: any[];
}) => {
  let result: any = {};
  const { attachments, to, from, html, subject, description } = options;

  const mailOptions: EmailMessage = {
    from: `${config.datasite.name} <${from}>`, // sender address
    to,
    subject: subject,
    text: description,
    html: html,
    attachments,
  };

  if (config.environment === EnvironmentEnum.Production) {
    result = await resend.emails.send({ ...mailOptions });
    console.log('response ====>', result);
  }
  if (config.environment === 'local') {
    const transporter = createTransport({
      host: config.implementations.mailSMTP.host,
      port: config.implementations.mailSMTP.port,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: config.implementations.mailSMTP.user, // generated ethereal user
        pass: config.implementations.mailSMTP.pass, // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    result = await transporter.sendMail({ ...mailOptions });
    console.log('response ====>', result);
  }

  return result;
};
