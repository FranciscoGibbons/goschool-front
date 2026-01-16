// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"],
  display: "swap",
  preload: true
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ]
};

export const metadata: Metadata = {
  title: {
    default: "GoSchool - Stella Maris Rosario",
    template: "%s | GoSchool - Stella Maris"
  },
  description: "Sistema integral de gestión académica para el Colegio Stella Maris Rosario. Gestiona calificaciones, exámenes, horarios y comunicación entre estudiantes, padres y profesores.",
  keywords: [
    "gestión académica",
    "colegio stella maris",
    "rosario",
    "sistema educativo",
    "calificaciones",
    "exámenes",
    "horarios",
    "estudiantes",
    "padres",
    "profesores"
  ],
  authors: [{ name: "Equipo GoSchool" }],
  creator: "GoSchool Team",
  publisher: "Colegio Stella Maris Rosario",
  
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "GoSchool - Stella Maris",
    title: "GoSchool - Sistema de Gestión Académica",
    description: "Plataforma integral para la gestión académica del Colegio Stella Maris Rosario",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GoSchool - Stella Maris Rosario"
      }
    ]
  },
  
  twitter: {
    card: "summary_large_image",
    title: "GoSchool - Stella Maris",
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
    "apple-mobile-web-app-title": "GoSchool"
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
        <meta name="application-name" content="GoSchool" />
        <meta name="apple-mobile-web-app-title" content="GoSchool" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
