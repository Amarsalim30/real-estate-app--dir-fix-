import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log("Middleware executed for:", req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access if user has a valid token
        return !!token;
      },
    },
  }
);

export const config = { 
  matcher: [
    "/dashboard/:path*", 
    "/property-listing/:path*",
    "/admin/:path*"
  ] 
};
