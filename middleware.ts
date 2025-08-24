import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/iconoficial.png",
    "/api/socket/io",
    "/api/socket/(.*)",
    "/api/rewards/cron",
    "/api/webhooks(.*)",
    "/api/livekit/(.*)",
    "/api/socket/calls/(.*)",
    "/api/socket/messages/(.*)",
    "/api/socket/direct-messages/(.*)",
  ],
  ignoredRoutes: [
    "/api/socket/(.*)",
    "/api/livekit/(.*)",
    "/api/rewards/(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
