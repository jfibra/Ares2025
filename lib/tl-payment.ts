import { randomUUID } from "crypto"
import { MAX_PAYMENT_ACCOUNTS, type TlPaymentAccount } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// Server only. The accounts and QR codes a team leader wants their agents to pay into.

export const PAYMENT_QR_BUCKET = "tl-payment-qr"
const TABLE = "team_leader_payment_accounts"
const COLUMNS = "id,bank,account_name,account_number,qr_path"
const MAX_QR_BYTES = 5 * 1024 * 1024
const QR_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

type AccountRow = { id: number; bank: string; account_name: string | null; account_number: string | null; qr_path: string | null }
export type AccountResult = { ok: true } | { ok: false; status: number; message: string }
const refuse = (message: string, status = 400): AccountResult => ({ ok: false, status, message })

/** Every account of one team leader, oldest first. QR storage paths become links that expire. */
export async function getTlPaymentDetails(teamLeaderId: number, qrLinkSeconds = 60 * 60): Promise<TlPaymentAccount[]> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq("team_leader_id", teamLeaderId).order("id")
  if (error) throw error
  const rows = (data ?? []) as AccountRow[]

  const paths = rows.map((row) => row.qr_path).filter((path): path is string => Boolean(path))
  const links = new Map<string, string>()
  if (paths.length) {
    const { data: signed, error: signError } = await supabase.storage.from(PAYMENT_QR_BUCKET).createSignedUrls(paths, qrLinkSeconds)
    if (signError) console.error("Payment QR links failed:", signError)
    for (const item of signed ?? []) if (item.path && item.signedUrl) links.set(item.path, item.signedUrl)
  }
  return rows.map((row) => ({
    id: row.id,
    bank: row.bank,
    account_name: row.account_name,
    account_number: row.account_number,
    qr_url: row.qr_path ? (links.get(row.qr_path) ?? null) : null,
  }))
}

/** Checks the fields of the add/edit form. The QR rule depends on what is already stored, so it is checked by the caller. */
function readAccountForm(form: FormData) {
  const text = (key: string) => String(form.get(key) ?? "").trim()
  const bank = text("bank")
  const accountName = text("account_name")
  const accountNumber = text("account_number")
  const upload = form.get("qr")
  const qr = upload instanceof File && upload.size > 0 ? upload : null

  let message: string | null = null
  if (!bank) message = "Enter the bank or e-wallet, e.g. BDO or GCash."
  else if (bank.length > 80) message = "The bank or e-wallet name is too long."
  else if (accountName.length > 120) message = "The account name is too long."
  else if (accountNumber.length > 60) message = "The account number is too long."
  else if (accountNumber && !accountName) message = "Add the account name that goes with the account number."
  else if (qr && qr.size > MAX_QR_BYTES) message = "The QR code image is larger than 5 MB."
  else if (qr && !QR_TYPES[qr.type]) message = "The QR code must be a JPG, PNG or WEBP image."

  return { message, bank, accountName, accountNumber, qr, removeQr: text("remove_qr") === "1" }
}

async function uploadQr(teamLeaderId: number, qr: File) {
  const path = `${teamLeaderId}/${randomUUID()}.${QR_TYPES[qr.type]}`
  const { error } = await createSupabaseAdmin()
    .storage.from(PAYMENT_QR_BUCKET)
    .upload(path, Buffer.from(await qr.arrayBuffer()), { contentType: qr.type, upsert: false })
  if (error) throw error
  return path
}

const removeFiles = async (paths: (string | null)[]) => {
  const real = paths.filter((path): path is string => Boolean(path))
  if (real.length) await createSupabaseAdmin().storage.from(PAYMENT_QR_BUCKET).remove(real)
}

export async function addPaymentAccount(teamLeaderId: number, form: FormData): Promise<AccountResult> {
  const input = readAccountForm(form)
  if (input.message) return refuse(input.message)
  if (!input.qr && !input.accountNumber) return refuse("Add an account number or a QR code for this account.")

  const supabase = createSupabaseAdmin()
  const { count, error: countError } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("team_leader_id", teamLeaderId)
  if (countError) throw countError
  if ((count ?? 0) >= MAX_PAYMENT_ACCOUNTS) return refuse(`You can list up to ${MAX_PAYMENT_ACCOUNTS} accounts. Delete one first.`, 409)

  const qrPath = input.qr ? await uploadQr(teamLeaderId, input.qr) : null
  const { error } = await supabase.from(TABLE).insert({
    team_leader_id: teamLeaderId,
    bank: input.bank,
    account_name: input.accountName || null,
    account_number: input.accountNumber || null,
    qr_path: qrPath,
  })
  if (error) {
    await removeFiles([qrPath]) // nothing was saved, so drop the file
    throw error
  }
  return { ok: true }
}

export async function updatePaymentAccount(teamLeaderId: number, id: number, form: FormData): Promise<AccountResult> {
  const input = readAccountForm(form)
  if (input.message) return refuse(input.message)

  const supabase = createSupabaseAdmin()
  const { data: current, error: readError } = await supabase
    .from(TABLE)
    .select("qr_path")
    .eq("id", id)
    .eq("team_leader_id", teamLeaderId)
    .maybeSingle()
  if (readError) throw readError
  if (!current) return refuse("This account no longer exists. Refresh and try again.", 404)

  const oldPath = current.qr_path as string | null
  const keepsQr = Boolean(input.qr) || (Boolean(oldPath) && !input.removeQr)
  if (!keepsQr && !input.accountNumber) return refuse("Add an account number or a QR code for this account.")

  const newPath = input.qr ? await uploadQr(teamLeaderId, input.qr) : input.removeQr ? null : oldPath
  const { error } = await supabase
    .from(TABLE)
    .update({
      bank: input.bank,
      account_name: input.accountName || null,
      account_number: input.accountNumber || null,
      qr_path: newPath,
    })
    .eq("id", id)
    .eq("team_leader_id", teamLeaderId)
  if (error) {
    if (input.qr) await removeFiles([newPath])
    throw error
  }
  if (oldPath && oldPath !== newPath) await removeFiles([oldPath])
  return { ok: true }
}

export async function deletePaymentAccount(teamLeaderId: number, id: number): Promise<AccountResult> {
  const { data, error } = await createSupabaseAdmin()
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("team_leader_id", teamLeaderId)
    .select("qr_path")
    .maybeSingle()
  if (error) throw error
  if (data) await removeFiles([data.qr_path as string | null])
  return { ok: true } // already gone counts as deleted
}
