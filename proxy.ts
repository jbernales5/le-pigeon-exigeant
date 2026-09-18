import { NextResponse, type NextRequest } from "next/server"

const PROTECTED = ["/collection", "/map", "/add", "/hotels", "/account"]

function hasSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((c) => c.name.includes("session_token") && c.value.length > 0)
}

// Optimistic redirect only: a visitor without any session cookie is sent to /login.
// The opposite direction (/login → /collection) is decided by the pages themselves after
// validating the session against the database, so a stale cookie can never cause a loop.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!hasSessionCookie(request) && PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)"],
}
