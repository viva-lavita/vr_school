import {NextResponse} from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register"];

function createMockJwt() {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    user_id: 1,
    email: "test@test.ru",
    exp: Math.floor(Date.now() / 1000) + 86400 * 365,
  }));
  const sig = btoa("mock-signature");
  return `${header}.${payload}.${sig}`;
}

export function middleware(req) {
    if (PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    let access = req.cookies.get("access")?.value;
    let refresh = req.cookies.get("refresh")?.value;

    // Dev mock: если нет токенов — ставим фейковые, чтобы не редиректит на /login
    if (!access && !refresh && process.env.NODE_ENV !== "production") {
        const mockToken = createMockJwt();
        const res = NextResponse.next();
        res.cookies.set("access", mockToken, { path: "/" });
        res.cookies.set("refresh", mockToken, { path: "/" });
        return res;
    }

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
