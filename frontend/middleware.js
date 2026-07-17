import {NextResponse} from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function middleware(req) {
    if (PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

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
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"
  ]
}
