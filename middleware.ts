import { NextResponse, type NextRequest } from "next/server"

// Quick first gate for the two portals: no session cookie, straight to that portal's sign-in.
// The pages and API routes still verify the cookie's signature and the person's role.
export function middleware(request: NextRequest) {
  if (!request.cookies.has("ares_session")) {
    const portal = request.nextUrl.pathname.startsWith("/tl") ? "/tl/login" : "/admin/login"
    return NextResponse.redirect(new URL(portal, request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ["/admin", "/tl"] }
