import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
// Import error handler first to catch errors early
import "@/packages/libs/error-handler";
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
      <head>
        {/* Early error handler script - runs before React and Next.js overlay */}
        <Script
          id="error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                
                function isAbortError(error) {
                  if (!error) return false;
                  var name = error.name || '';
                  var message = String(error.message || '');
                  var str = String(error || '');
                  return name === 'AbortError' ||
                         (name === 'DOMException' && message.includes('aborted')) ||
                         message.toLowerCase().includes('aborted') ||
                         message.toLowerCase().includes('user aborted') ||
                         str.toLowerCase().includes('abort');
                }
                
                function isCheckoutPopupError(error) {
                  if (!error) return false;
                  var message = String(error.message || '');
                  return message.includes('No checkout popup config found') ||
                         message.includes('checkout popup');
                }
                
                // Handle unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
                  if (isAbortError(event.reason) || isCheckoutPopupError(event.reason)) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                // Handle uncaught errors
                window.addEventListener('error', function(event) {
                  if (isAbortError(event.error) || isAbortError(event.message) ||
                      isCheckoutPopupError(event.error) || isCheckoutPopupError(event.message)) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                // Override window.onunhandledrejection
                window.onunhandledrejection = function(event) {
                  if (isAbortError(event.reason) || isCheckoutPopupError(event.reason)) {
                    event.preventDefault();
                    return false;
                  }
                };
                
                // Override window.onerror
                window.onerror = function(message, source, lineno, colno, error) {
                  if (isAbortError(error) || isAbortError(message) ||
                      isCheckoutPopupError(error) || isCheckoutPopupError(message)) {
                    return true;
                  }
                  return false;
                };
              })();
            `,
          }}
        />
      </head>
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
