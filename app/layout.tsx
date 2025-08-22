import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";

import { appFileRouter } from "@/app/api/uploadthing/core";
import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { RewardsCronProvider } from "@/components/providers/rewards-cron-provider";
import { CallProvider } from "@/components/providers/call-provider";
import { PersistentCall } from "@/components/persistent-call";
import { GlobalAnnouncementsListener } from "@/components/global-announcements-listener";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

import "./globals.css";

const font = Open_Sans({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#7C3AED",
};

export const metadata: Metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={cn(font.className, "bg-white dark:bg-[#313338]")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="callcord-theme"
          >
            <SocketProvider>
              <NextSSRPlugin
                routerConfig={extractRouterConfig(appFileRouter)}
              />

              <ModalProvider />
              <QueryProvider>
                <CallProvider>
                  {children}
                  <PersistentCall />
                  <GlobalAnnouncementsListener />
                </CallProvider>
              </QueryProvider>
              <RewardsCronProvider />
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
