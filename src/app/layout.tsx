import type { Metadata } from "next";
import { Inter, Roboto, Montserrat } from "next/font/google";
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

export const metadata: Metadata = {
  title: "StutterLab - Evidence-Based Stuttering Treatment",
  description:
    "The first browser-based platform combining DAF, FAF, AI speech analysis, and real-world conversation practice for stuttering treatment.",
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
                else if (t === 'dark') document.documentElement.classList.add('dark');
                else if (!window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.remove('dark');
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
