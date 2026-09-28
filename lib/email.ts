import nodemailer, { type Transporter } from "nodemailer";

// Sends email through SMTP (set up for Zoho Mail / support@z-swap.com).
// If the SMTP_* settings are missing, emails are skipped and logged instead,
// so the rest of the app keeps working.

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const port = Number(SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    pool: true,
    maxConnections: 3,
  });
  return transporter;
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[email] SMTP not configured, skipped email to ${opts.to}: ${opts.subject}`);
    return false;
  }
  const from = process.env.EMAIL_FROM || `Z-Swap <${process.env.SMTP_USER}>`;
  await t.sendMail({ from, ...opts });
  return true;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function appUrl(path = "") {
  const base = (process.env.APP_URL || process.env.NEXTAUTH_URL || "https://z-swap.com").replace(/\/$/, "");
  return base + path;
}

// Simple branded layout shared by all Z-Swap emails.
export function emailLayout(heading: string, bodyHtml: string, cta?: { label: string; href: string }) {
  const button = cta
    ? `<p style="margin:28px 0"><a href="${cta.href}" style="background:#15803d;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f6f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;padding:28px">
<tr><td>
<p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#15803d">Z-Swap</p>
<h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(heading)}</h1>
${bodyHtml}
${button}
<p style="margin:24px 0 0;font-size:12px;color:#6b7280;line-height:1.5">Reminder: never pay an incentive to another user before your swap is officially confirmed on Z-Swap.<br>You are receiving this because you have an account on z-swap.com. Questions? Reply to this email or write to support@z-swap.com.</p>
</td></tr></table></td></tr></table></body></html>`;
}
