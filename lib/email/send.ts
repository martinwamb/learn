import nodemailer from "nodemailer";

// Mirrors publisher-site's working SMTP config against the same self-hosted Mailcow
// server, sending from a dedicated learn@wambugumartin.com mailbox instead of
// publisher-site's own (different brand identity -- these shouldn't be mixed).
const transport = nodemailer.createTransport({
  host: "mail.wambugumartin.com",
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
