import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/iconoficial.png",
    "/api/socket/io",
    "/api/socket/(.*)",
    "/api/rewards/cron",
    "/api/webhooks(.*)",
    "/api/livekit/(.*)"
  ],
  ignoredRoutes: [
    "/api/socket/(.*)",
    "/api/livekit/(.*)"
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
