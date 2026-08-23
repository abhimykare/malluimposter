import type { Metadata, Viewport } from "next";
import { Anek_Malayalam, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { STORAGE_KEY } from "@/lib/storage";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  THEME_COLOR_DARK,
} from "@/lib/site";

import "./globals.css";

const latin = Manrope({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
  weight: "variable",
});

const malayalam = Anek_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-malayalam",
  display: "swap",
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Malayalam & English Imposter Party Game`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — One word. One imposter.`,
    description: APP_DESCRIPTION,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: APP_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — One word. One imposter.`,
    description: APP_DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: THEME_COLOR_DARK,
  colorScheme: "dark light",
};

/**
 * Applies the persisted theme + language before first paint to avoid a flash.
 * Kept tiny and defensive; any failure simply leaves the defaults in place.
 */
const themeScript = `(function(){try{var d=document.documentElement,t='dark',l=null;var r=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)});if(r){var p=JSON.parse(r),s=p&&p.state;if(s){if(s.theme==='light'||s.theme==='dark'||s.theme==='system')t=s.theme;if(s.settings&&(s.settings.language==='ml'||s.settings.language==='en'))l=s.settings.language;}}if(t==='system')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';d.setAttribute('data-theme',t);if(l)d.setAttribute('lang',l);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${latin.variable} ${malayalam.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-bg text-fg">
        <StoreHydrator />
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
