import nodemailer from "nodemailer"

// Server only. Sends email through the SMTP account in the environment:
// MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS, MAIL_FROM_NAME.

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter
  const host = process.env.MAIL_HOST
  const user = process.env.MAIL_USERNAME
  const pass = process.env.MAIL_PASSWORD
  if (!host || !user || !pass) throw new Error("Email is not set up: MAIL_HOST, MAIL_USERNAME and MAIL_PASSWORD are needed.")
  const port = Number(process.env.MAIL_PORT) || 465
  transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  return transporter
}

export async function sendEmail(message: { to: string; subject: string; text: string; html: string }) {
  const address = process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || ""
  const name = process.env.MAIL_FROM_NAME || "ARES 2027"
  await getTransporter().sendMail({ from: { name, address }, ...message })
}
