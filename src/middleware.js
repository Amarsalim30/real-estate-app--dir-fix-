import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    console.log("🔥 Middleware is running for:", pathname);
    console.log("User role:", token?.role);

    // Admin route protection
    if (pathname.startsWith("/dashboard/admin")) {
      if (token?.role !== "ADMIN") {
        console.warn("🚫 Access denied: Admin role required");
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Authenticated user but not admin
    if (pathname.startsWith("/dashboard") && !token) {
      console.warn("🚫 Access denied: Login required for dashboard");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        const publicRoutes = [
          "/",
          "/projects",
          "/search",
          "/about",
          "/contact",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ];

        const publicApiRoutes = [
          "/api/auth",
          "/api/properties/public",
          "/api/search",
          "/api/contact",
        ];

        // Allow all public routes
        if (
          publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/")) ||
          publicApiRoutes.some((route) => pathname.startsWith(route))
        ) {
          return true;
        }

        // Admin routes
        if (pathname.startsWith("/dashboard/admin")) {
          return token?.role === "ADMIN";
        }

        // Other dashboard routes (require logged-in user)
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        // Default: allow access
        return true;
      },
    },
  }
);

// Protect all dashboard routes and root-level paths
export const config = {
  matcher: ["/dashboard/:path*", "/:path"],
};
