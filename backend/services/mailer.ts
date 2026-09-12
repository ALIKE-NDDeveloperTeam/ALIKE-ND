import nodemailer from "nodemailer";

let cachedTransporter: any = null;

export function getMailerTransporter(): any {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!user || !pass) {
    return null;
  }

  // Gmail SMTP with connection pooling for rapid dispatch
  cachedTransporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS / STARTTLS
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return cachedTransporter;
}

export async function sendOtpEmail(toEmail: string, otpCode: string, purpose: string = "verification") {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  const startTimestamp = Date.now();
  const startTimeIso = new Date(startTimestamp).toISOString();
  console.log(`⏱️ [OTP GENERATED at ${startTimeIso}] Recipient: ${toEmail} | Purpose: ${purpose} | Code: ${otpCode}`);

  const purposeTitles: Record<string, string> = {
    registration: "Account Registration Verification",
    forgot_password: "Password Reset Authorization",
    login: "Two-Factor Authentication",
    verification: "Identity Verification",
  };

  const subjectTitle = purposeTitles[purpose] || "Verification Code";

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #0F1A3C; padding: 24px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">
          ALIKE<span style="color: #F5A623;">-ND</span>
        </h1>
        <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">
          Luxury Shopping Platform
        </p>
      </div>
      <div style="padding: 28px 24px; color: #1e293b;">
        <h2 style="font-size: 17px; font-weight: 700; color: #0F1A3C; margin-top: 0; margin-bottom: 12px;">
          ${subjectTitle}
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
          Use the following 6-digit One-Time Password (OTP) to complete your verification. This code is strictly valid for <strong>10 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #F5A623; border-radius: 12px; padding: 14px 32px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F1A3C; font-family: monospace;">
              ${otpCode}
            </span>
          </div>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 14px;">
          ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. Alike-ND representatives will never ask for your verification code.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          If you did not request this verification code, you can safely ignore this email.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">
          &copy; ${new Date().getFullYear()} Alike-ND Ecommerce Platform. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const textContent = `Your Alike-ND verification code is: ${otpCode}. It expires in 10 minutes. Do not share this code with anyone.`;

  if (!user || !pass) {
    console.warn("⚠️ [GMAIL SMTP WARNING] GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment.");
    console.warn(`🔑 [DEV/TEST OTP CODE] ${toEmail}: ${otpCode} (Expires in 10 mins)`);
    return {
      sent: false,
      mode: "development_logged",
      code: otpCode,
      message: "GMAIL_USER and GMAIL_APP_PASSWORD not configured. OTP logged to server console.",
    };
  }

  try {
    const transport = getMailerTransporter();
    if (!transport) {
      throw new Error("Could not initialize Gmail SMTP transport");
    }

    const info = await transport.sendMail({
      from: `"Alike-ND Security" <${user}>`,
      replyTo: user,
      to: toEmail,
      subject: `Your Alike-ND OTP: ${otpCode} (${subjectTitle})`,
      text: textContent,
      html: htmlContent,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    });

    const elapsedMs = Date.now() - startTimestamp;
    const sentTimeIso = new Date().toISOString();
    console.log(`✅ [GMAIL SMTP SENT at ${sentTimeIso} in ${elapsedMs}ms] Successfully sent email to ${toEmail}. MessageId: ${info.messageId}`);
    return {
      sent: true,
      mode: "gmail_smtp",
      messageId: info.messageId,
      message: "OTP successfully dispatched via Gmail SMTP",
      elapsedMs,
      sentAt: sentTimeIso,
    };
  } catch (err: any) {
    console.error("❌ [GMAIL SMTP ERROR]:", err.message || err);
    console.warn(`🔑 [FALLBACK LOG] OTP for ${toEmail}: ${otpCode}`);
    return {
      sent: false,
      mode: "error_logged",
      code: otpCode,
      error: err.message || "Failed to send email via Gmail SMTP",
    };
  }
}
