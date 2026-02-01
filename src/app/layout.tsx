// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { branding, brandingMeta } from "@/config/branding";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600"]
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "600"]
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3d7a5a"
};


export const metadata: Metadata = {
  title: {
    default: brandingMeta.defaultTitle,
    template: brandingMeta.titleTemplate
  },
  description: `Sistema integral de gestión académica para ${branding.schoolFullName}. Gestiona calificaciones, exámenes, horarios y comunicación entre estudiantes, padres y profesores.`,
  keywords: [
    "gestión académica",
    branding.schoolName.toLowerCase(),
    "sistema educativo",
    "calificaciones",
    "exámenes",
    "horarios",
    "estudiantes",
    "padres",
    "profesores"
  ],
  authors: [{ name: `Equipo ${branding.appName}` }],
  creator: `${branding.appName} Team`,
  publisher: branding.schoolFullName,

  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),

  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: brandingMeta.siteName,
    title: `${branding.appName} - Sistema de Gestión Académica`,
    description: `Plataforma integral para la gestión académica de ${branding.schoolFullName}`,
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: brandingMeta.defaultTitle
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: brandingMeta.siteName,
    description: "Sistema integral de gestión académica",
    images: ["/images/twitter-card.jpg"]
  },

  robots: {
    index: false, // Sistema privado, no indexar
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/icon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/images/icon-32x32.png", type: "image/png", sizes: "32x32" }
    ],
    apple: [
      { url: "/images/apple-touch-icon.png", sizes: "180x180" }
    ]
  },

  manifest: "/manifest.json",

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": branding.appName
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
        {/* Preconnect para recursos externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch para el backend */}
        <link rel="dns-prefetch" href="https://163.176.141.4" />
        
        {/* Security headers adicionales */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* PWA meta tags */}
        <meta name="application-name" content={branding.appName} />
        <meta name="apple-mobile-web-app-title" content={branding.appName} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3d7a5a" />

        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${sourceSans.variable} ${sourceSerif.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          themes={["light"]}
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>

    </html>
  );
}
