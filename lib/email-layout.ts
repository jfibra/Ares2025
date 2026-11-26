// The ARES 2027 look for every email we send: royal purple and Thai gold on cream, like the site.
// Built from tables and inline styles only, because that is what email apps reliably show.

const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
const SERIF = "Georgia,'Times New Roman',serif"
const SANS = "'Segoe UI',Helvetica,Arial,sans-serif"
const GOLD_BAR = "background-color:#c9972f;background-image:linear-gradient(90deg,#8a6417,#f3d27a,#c9972f,#f3d27a,#8a6417);"

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string)

/** A paragraph of body text. `html` is trusted markup: escape anything a person typed. */
export const emailParagraph = (html: string) =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.65;color:#4a3a2a;">${html}</p>`

/** The gold call-to-action button, centred. */
export const emailButton = (label: string, url: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:26px auto;">
  <tr><td align="center" bgcolor="#d4a437" style="border-radius:12px;border:1px solid #8a6417;background-color:#d4a437;background-image:linear-gradient(90deg,#b8862b,#f3d27a,#b8862b);">
    <a href="${url}" style="display:inline-block;padding:15px 38px;font-family:${SANS};font-size:17px;font-weight:bold;color:#2a1408;text-decoration:none;border-radius:12px;">${escapeHtml(label)}</a>
  </td></tr>
</table>`

/** A cream box with a dashed gold edge, for the one thing they must not miss. */
export const emailNotice = (html: string) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;">
  <tr><td bgcolor="#fdf3d7" style="padding:16px 20px;border:1px dashed #c9972f;border-radius:14px;background-color:#fdf3d7;font-family:${SANS};font-size:15px;line-height:1.6;color:#5c4a2a;">${html}</td></tr>
</table>`

/** Numbered steps, each number in a purple and gold circle. */
export const emailSteps = (steps: string[]) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
  ${steps
    .map(
      (step, index) => `<tr>
    <td width="44" valign="top" style="padding:0 0 14px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="32" height="32" align="center" valign="middle" bgcolor="#2a1458" style="width:32px;height:32px;border-radius:16px;border:2px solid #f3d27a;background-color:#2a1458;font-family:${SANS};font-size:15px;font-weight:bold;color:#fbe7a1;">${index + 1}</td></tr></table>
    </td>
    <td valign="top" style="padding:5px 0 14px;font-family:${SANS};font-size:15px;line-height:1.55;color:#4a3a2a;">${step}</td>
  </tr>`,
    )
    .join("")}
</table>`

/** A small gold ornament between sections. */
const flourish = (color: string) =>
  `<p style="margin:0;font-family:${SERIF};font-size:16px;letter-spacing:10px;color:${color};text-align:center;">&#10022;&nbsp;&#10070;&nbsp;&#10022;</p>`

/**
 * Wraps the body of an email in the ARES 2027 frame.
 * `thai` is the short Thai line above the title; `preview` is the line inboxes show after the subject.
 */
export function aresEmail({ thai, title, preview, body }: { thai: string; title: string; preview: string; body: string }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#fbf5e6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#fbf5e6;">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fbf5e6" style="background-color:#fbf5e6;">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border:1px solid #d4a437;border-radius:22px;overflow:hidden;background-color:#ffffff;">
      <tr><td height="6" style="height:6px;font-size:0;line-height:0;${GOLD_BAR}">&nbsp;</td></tr>
      <tr><td align="center" bgcolor="#2a1458" style="padding:34px 28px 30px;background-color:#2a1458;background-image:linear-gradient(135deg,#2a1458 0%,#1a0d3d 55%,#3a0d2a 100%);">
        <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
          <td valign="middle" style="padding-right:14px;"><img src="${LOGO_URL}" alt="Asian Real Estate Summit" height="54" style="display:block;height:54px;width:auto;border:0;"></td>
          <td valign="middle" style="padding-left:14px;border-left:1px solid #7c6aa8;font-family:${SANS};font-size:34px;font-weight:900;line-height:1;color:#ffffff;">2027</td>
        </tr></table>
        <p lang="th" style="margin:26px 0 6px;font-family:${SANS};font-size:18px;color:#f3d27a;">${escapeHtml(thai)}</p>
        <h1 style="margin:0 0 16px;font-family:${SERIF};font-size:27px;line-height:1.25;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#f3d27a;">${escapeHtml(title)}</h1>
        ${flourish("#d4a437")}
      </td></tr>
      <tr><td height="4" style="height:4px;font-size:0;line-height:0;${GOLD_BAR}">&nbsp;</td></tr>
      <tr><td style="padding:34px 32px 26px;background-color:#ffffff;">${body}</td></tr>
      <tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="height:1px;font-size:0;line-height:0;background-color:#e3d3a8;">&nbsp;</td></tr></table></td></tr>
      <tr><td align="center" style="padding:22px 32px 26px;background-color:#ffffff;">
        <p lang="th" style="margin:0 0 4px;font-family:${SANS};font-size:16px;color:#b8862b;">ขอบคุณ</p>
        <p style="margin:0;font-family:${SERIF};font-size:16px;font-weight:bold;color:#2a1458;">Thank you, the ARES 2027 Team</p>
      </td></tr>
      <tr><td align="center" bgcolor="#2a1458" style="padding:20px 28px;background-color:#2a1458;background-image:linear-gradient(135deg,#2a1458 0%,#1a0d3d 55%,#3a0d2a 100%);">
        ${flourish("#d4a437")}
        <p style="margin:10px 0 0;font-family:${SANS};font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#f3d27a;">Asian Real Estate Summit 2027</p>
        <p style="margin:8px 0 0;font-family:${SANS};font-size:12px;line-height:1.5;color:#c9bfe0;">This is an automatic message about your ARES 2027 registration.</p>
      </td></tr>
      <tr><td height="6" style="height:6px;font-size:0;line-height:0;${GOLD_BAR}">&nbsp;</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}
