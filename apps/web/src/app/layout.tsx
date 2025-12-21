import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { ApolloClientProvider } from "@/packages/libs";
import { AuthProvider } from "@/packages/libs/auth";
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { sanitizeForRSC } from "@/packages/utils";
import { Providers } from "@/packages/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProRab.space — твой молоток в кармане!",
  description: "Забудь про тетрадки и Excel. Управляй объектами, расходами и отчётами клиенту за 2 клика. С Telegram-логином — войди за 3 секунды и попробуй демо-объект бесплатно.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale()
  const rawMessages = await getMessages()
  const messages = sanitizeForRSC(rawMessages)
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ApolloClientProvider>
            <AuthProvider>
              <NextIntlClientProvider messages={messages}>
                <Suspense fallback={null}>
                  {children}
                </Suspense>
              </NextIntlClientProvider>
            </AuthProvider>
          </ApolloClientProvider>
        </Providers>
      </body>
    </html>
  );
}
