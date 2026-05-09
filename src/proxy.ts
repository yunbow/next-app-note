import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/about",
    "/terms",
    "/privacy",
    "/cookies",
  ];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/notes", req.url));
  }

  // Protect private routes
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // CSP with nonce per-request (security.md §3.4)
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const imgSrc = isDev
    ? "img-src 'self' data: https: http://localhost:9002"
    : "img-src 'self' data: https:";
  const connectSrc = isDev
    ? "connect-src 'self' https: ws://localhost:*"
    : "connect-src 'self' https: wss:";

  const csp = [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    imgSrc,
    "font-src 'self' data:",
    connectSrc,
    "frame-ancestors 'none'",
  ].join("; ");

  const response = NextResponse.next({
    request: {
      headers: new Headers([...req.headers, ["x-request-id", requestId]]),
    },
  });
  response.headers.set("x-request-id", requestId);
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);
  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|brand/).*)",
  ],
};
