export type EmailResult = { sent: boolean; enabled: boolean; detail: string };
export async function sendTransactionalEmail(_input: { to: string; subject: string; text: string }): Promise<EmailResult> {
  const configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM);
  if (!configured) return { sent: false, enabled: false, detail: "Transactional email is not configured." };
  return { sent: false, enabled: true, detail: "SMTP credentials are present, but delivery remains disabled until an approved mail adapter is installed." };
}
