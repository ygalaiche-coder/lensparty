import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@lensparty.com";

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string, userName: string): Promise<void> {
  if (!resend) {
    console.log(`[EMAIL - DEV MODE] Password reset for ${toEmail}: ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: `LensParty <${FROM_EMAIL}>`,
    to: toEmail,
    subject: "Reset your LensParty password",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: #7C3AED; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: white; font-size: 24px;">&#128248;</span>
            </div>
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0; font-weight: 700;">LensParty</h1>
          </div>
          <h2 style="color: #1a1a2e; font-size: 20px; margin-bottom: 8px;">Reset your password</h2>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 8px;">Hi ${userName},</p>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
            We received a request to reset the password for your LensParty account. Click the button below to set a new password. This link expires in 24 hours.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${resetUrl}" style="background: #7C3AED; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 13px; text-align: center;">
            If you didn't request a password reset, you can safely ignore this email.<br>
            This link will expire in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            &copy; 2026 LensParty
          </p>
        </div>
      </body>
      </html>
    `,
  });
}
