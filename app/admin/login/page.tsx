import type { Metadata } from "next"
import { redirect } from "next/navigation"
import PortalLogin from "@/components/portal-login"
import { getSignedInRole } from "@/lib/auth"

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const role = await getSignedInRole()
  if (role) redirect(role === "admin" ? "/admin" : "/tl")
  return <PortalLogin variant="admin" />
}
