import {NextResponse} from "next/server";

export function middleware(req) {
    const access = req.cookies.get("access")?.value;
    const refresh = req.cookies.get("refresh")?.value

    if (!access && !refresh) {
        const loginUrl = new URL("/login", req.url)
        return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
}

export const config = {
  matcher: [
    "/account/:path*"
  ]
}
