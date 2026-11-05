import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport(
    process.env.SMTP_HOST
        ? {
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT) || 587,
              secure: Number(process.env.SMTP_PORT) === 465,
              auth: {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
              },
          }
        : {
              service: 'gmail',
              auth: {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
              },
          }
);

export const verifyMailer = async () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Nodemailer SMTP connection warning: Chưa cấu hình SMTP_USER hoặc SMTP_PASS trong file .env.');
        return false;
    }

    try {
        await transporter.verify();
        console.log(`Successfully connected to Nodemailer SMTP server (${process.env.SMTP_USER})!`);
        return true;
    } catch (error) {
        console.error('Nodemailer SMTP connection error:', error.message);
        return false;
    }
};

export default transporter;