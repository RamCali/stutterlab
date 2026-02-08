import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stutterlab.com";
const SITE_NAME = "StutterLab";

export function createMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      ...data,
    }),
  };
}

export const organizationJsonLd = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Evidence-based stuttering treatment platform powered by AI. Combines DAF, FAF, speech analysis, and real-world practice.",
};

export const SITE = { url: SITE_URL, name: SITE_NAME };
