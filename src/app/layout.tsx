import type { Metadata } from "next";
import { Inter, Roboto, Montserrat } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PM5PWCRP');`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} ${montserrat.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PM5PWCRP"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
