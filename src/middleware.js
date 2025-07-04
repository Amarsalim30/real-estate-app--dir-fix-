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

    // Dashboard routes protection (require authentication)
    if (pathname.startsWith("/dashboard") && !token) {
      console.warn("🚫 Access denied: Login required for dashboard");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Units routes protection (require authentication)
    if (pathname.startsWith("/units") && !token) {
      console.warn("🚫 Access denied: Login required for units");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Buyers routes protection (require authentication)
    if (pathname.startsWith("/buyers") && !token) {
      console.warn("🚫 Access denied: Login required for buyers");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Payments routes protection (require authentication)
    if (pathname.startsWith("/payments") && !token) {
      console.warn("🚫 Access denied: Login required for payments");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Invoices routes protection (require authentication)
    if (pathname.startsWith("/invoices") && !token) {
      console.warn("🚫 Access denied: Login required for invoices");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Projects creation/editing protection (require authentication)
    if ((pathname.startsWith("/projects/new") || pathname.includes("/projects/") && pathname.includes("/edit")) && !token) {
      console.warn("🚫 Access denied: Login required for project management");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
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
          "/unauthorized"
        ];

        // Public API routes
        const publicApiRoutes = [
          "/api/auth",
          "/api/properties/public",
          "/api/search",
          "/api/contact",
          "/api/forgot-password",
          "/api/reset-password"
        ];

        // Allow all public routes
        if (
          publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/")) ||
          publicApiRoutes.some((route) => pathname.startsWith(route))
        ) {
          return true;
        }

        // Admin routes - require ADMIN role
        if (pathname.startsWith("/dashboard/admin")) {
          return token?.role === "ADMIN";
        }

        // Protected routes - require authentication
        const protectedRoutes = [
          "/dashboard",
          "/units",
          "/buyers",
          "/payments",
          "/invoices"
        ];

        if (protectedRoutes.some(route => pathname.startsWith(route))) {
          return !!token;
        }

        // Project management routes - require authentication
        if (pathname.startsWith("/projects/new") || 
            (pathname.includes("/projects/") && pathname.includes("/edit"))) {
          return !!token;
        }

        // Default: allow access for other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
