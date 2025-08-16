import nodemailer from 'nodemailer';
import { redis } from '../../config/redis/connection';
import { logger } from '../../utils/logger';
import { OTPData } from '../../types/otp.types';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class OTPService {
  private transporter: nodemailer.Transporter;
  private otpExpiryMinutes: number;

  constructor() {
    this.otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
    
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      family: 4,
      tls: {
        rejectUnauthorized: false,
      },
    } as SMTPTransport.Options);
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getOTPKey(email: string): string {
    return `otp:${email}`;
  }

  async generateAndStoreOTP(email: string, otpData: Omit<OTPData, 'otp' | 'created_at'>): Promise<string> {
    const otp = this.generateOTP();
    const key = this.getOTPKey(email);
    
    const data: OTPData = {
      ...otpData,
      otp,
      created_at: Date.now(),
    };

    const expirySeconds = this.otpExpiryMinutes * 60;
    await redis.set(key, JSON.stringify(data), expirySeconds);
    
    logger.info(`OTP generated for email: ${email}`);
    return otp;
  }

  async verifyOTP(email: string, providedOTP: string): Promise<OTPData | null> {
    const key = this.getOTPKey(email);
    const storedData = await redis.get(key);
    
    if (!storedData) {
      logger.warn(`OTP not found or expired for email: ${email}`);
      return null;
    }

    const otpData: OTPData = JSON.parse(storedData);
    
    if (otpData.otp !== providedOTP) {
      logger.warn(`Invalid OTP provided for email: ${email}`);
      return null;
    }

    await redis.del(key);
    logger.info(`OTP verified successfully for email: ${email}`);
    
    return otpData;
  }

  async sendOTPEmail(email: string, otp: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: `"WorkOrbit" <${process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@workorbit.com'}>`,
      to: email,
      subject: 'Your WorkOrbit Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">WorkOrbit Verification Code</h2>
          <p>Hello ${firstName || ''},</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2c3e50;">${otp}</span>
          </div>
          <p>This code will expire in ${this.otpExpiryMinutes} minutes.</p>
          <p>If you didn’t request this code, please ignore this email.</p>
          <p>Thanks,<br>The WorkOrbit Team</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`OTP email sent to ${email}, messageId: ${info.messageId}`);
    } catch (error) {
      logger.error(`Failed to send OTP email to ${email}:`, error);

      if (error instanceof Error) {
        if (error.message.includes('EAUTH')) {
          throw new Error('Email authentication failed. Please check SMTP_USER and SMTP_PASS.');
        } else if (error.message.includes('ENOTFOUND')) {
          throw new Error('Email server not found. Check your SMTP host or internet connection.');
        } else if (error.message.includes('ETIMEDOUT')) {
          throw new Error('Email sending timed out. Try again later.');
        }
      }

      throw new Error('Failed to send verification email. Please try again later.');
    }
  }

  async deleteOTP(email: string): Promise<void> {
    const key = this.getOTPKey(email);
    await redis.del(key);
    logger.info(`OTP deleted for email: ${email}`);
  }
}