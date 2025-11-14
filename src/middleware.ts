export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",   // Protect full dashboard
    "/api/ratings/:path*", // Protect ratings API
    "/api/segments/:path*", // Protect segments CRUD
    "/api/vendors/:path*", // Protect vendor CRUD
    "/api/pdf"             // Protect PDF report
  ]
};
