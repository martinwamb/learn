import nodemailer from "nodemailer";

// Sends from a dedicated learn@wambugumartin.com address instead of publisher-site's
// own (different brand identity -- these shouldn't be mixed). Relay is Brevo
// (EMAIL_SMTP_HOST); without it, the old self-hosted Mailcow host is used.
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST ?? "mail.wambugumartin.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SMTP_USER ?? "learn@wambugumartin.com",
    pass: process.env.EMAIL_SMTP_PASS ?? "",
  },
  tls: { rejectUnauthorized: false },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transport.sendMail({
    from: '"Learn Platform" <learn@wambugumartin.com>',
    to,
    subject,
    html,
  });
}
