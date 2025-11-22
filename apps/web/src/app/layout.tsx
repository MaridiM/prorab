import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { ApolloClientProvider } from "@/packages/libs";
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { sanitizeForRSC } from "@/packages/utils";

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
    <html lang={locale} >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloClientProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ApolloClientProvider>
      </body>
    </html>
  );
}
