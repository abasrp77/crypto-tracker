import nodemailer from "nodemailer";
import type { H3Event } from "h3";
import { getRequestHost, getRequestProtocol } from "h3";

/**
 * Resolves the application base URL dynamically across environments:
 * 1. Custom override passed directly to the function
 * 2. Incoming HTTP Request headers (Host & X-Forwarded-Host / Proto) - automatically detects real domain & subdomain with zero config
 * 3. Explicit environment variables (APP_URL or NUXT_PUBLIC_APP_URL)
 * 4. Nuxt runtime config (runtimeConfig.public.appUrl)
 * 5. Auto-detected cloud provider domain variables in production (Vercel, Render, Railway)
 * 6. Fallback to http://localhost:3000 for local development
 */
export const getAppBaseUrl = (event?: H3Event, overrideUrl?: string): string => {
  if (overrideUrl) {
    return overrideUrl.replace(/\/+$/, "");
  }

  // 1. Auto-detect directly from incoming HTTP request (handles any domain, subdomain, tunnel, or port automatically)
  if (event) {
    try {
      const host = getRequestHost(event, { xForwardedHost: true });
      const proto =
        getRequestProtocol(event, { xForwardedProto: true }) ||
        (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
      if (host) {
        return `${proto}://${host}`.replace(/\/+$/, "");
      }
    } catch {
      // Graceful fallback if request inspection fails
    }
  }

  // 2. Explicit environment variables
  const envUrl = process.env.APP_URL || process.env.NUXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  // 3. Runtime configuration
  try {
    const config = useRuntimeConfig();
    const runtimeUrl = config.public?.appUrl || (config as any).appUrl;
    if (runtimeUrl && typeof runtimeUrl === "string") {
      return runtimeUrl.replace(/\/+$/, "");
    }
  } catch {
    // Graceful fallback outside Nuxt runtime context
  }

  // 4. Auto-detected cloud platform domains in production
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, "");
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  // 5. Fallback for local development
  return "http://localhost:3000";
};

interface SendVerificationMailOptions {
  to: string;
  name: string;
  code: string;
  token: string;
  event?: H3Event;
  baseUrl?: string;
}

export const sendVerificationEmail = async ({
  to,
  name,
  code,
  token,
  event,
  baseUrl: overrideUrl,
}: SendVerificationMailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const baseUrl = getAppBaseUrl(event, overrideUrl);
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: '"CryptoTracker Security" <no-reply@cryptotracker.app>',
    to,
    subject: "Verify your CryptoTracker Account",
    html: `
      <div style="background-color: #0d1117; color: #c9d1d9; font-family: sans-serif; padding: 40px; border-radius: 12px; max-width: 500px; margin: auto;">
        <h2 style="color: #ffffff; text-align: center;">Verify Your Email</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up. Use this 6-digit code to activate your account:</p>
        <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #38bdf8;">${code}</span>
        </div>
        <p style="text-align: center;">Or click the button below to verify instantly:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #8b949e; text-align: center;">This code and link will expire in 15 minutes.</p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async ({
  to,
  name,
  token,
  event,
  baseUrl: overrideUrl,
}: {
  to: string;
  name: string;
  token: string;
  event?: H3Event;
  baseUrl?: string;
}) => {
  const baseUrl = getAppBaseUrl(event, overrideUrl);
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"CryptoTracker Security" <security@cryptotracker.app>',
      to,
      subject: "Reset Your Password",
      html: `
        <div style="background-color: #0d1117; color: #c9d1d9; font-family: sans-serif; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
          <h2 style="color: #ffffff; text-align: center;">Reset Password</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to choose a new one:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #8b949e; text-align: center;">This link will expire in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
  }
};
