import type { Metadata } from "next";
import { Inter, Roboto, Montserrat } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers";
import "./globals.css";

const GA_ID = "G-9B42W9RL5D";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stutterlab.com";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  title: {
    default: "StutterLab - Evidence-Based Stuttering Training",
    template: "%s | StutterLab",
  },
  description:
    "The first browser-based platform combining DAF, FAF, AI speech analysis, and real-world conversation practice for stuttering training.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/logo/StutterLab_favicon.svg",
    apple: "/logo/StutterLab_favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "StutterLab",
    title: "StutterLab - Evidence-Based Stuttering Training",
    description:
      "AI-powered stuttering training with DAF, FAF, speech analysis, and daily structured practice. Browser-based, no downloads.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StutterLab - Evidence-Based Stuttering Training",
    description:
      "AI-powered stuttering training with DAF, FAF, speech analysis, and daily structured practice.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'light') document.documentElement.classList.remove('dark');
                else document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
        {GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} ${montserrat.variable} antialiased`}
      >
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
