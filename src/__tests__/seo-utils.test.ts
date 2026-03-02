import { describe, it, expect } from "vitest";
import { createMetadata, jsonLd, SITE } from "@/lib/seo";

// ─── SEO Metadata ───

describe("createMetadata", () => {
  it("creates metadata with title and site name", () => {
    const meta = createMetadata({
      title: "AI Speech Training",
      description: "Train your speech with AI",
      path: "/ai-speech-training",
    });
    expect(meta.title).toBe("AI Speech Training | StutterLab");
    expect(meta.description).toBe("Train your speech with AI");
  });

  it("sets canonical URL", () => {
    const meta = createMetadata({
      title: "Test",
      description: "Desc",
      path: "/test-page",
    });
    expect(meta.alternates?.canonical).toContain("/test-page");
  });

  it("includes Open Graph data", () => {
    const meta = createMetadata({
      title: "OG Test",
      description: "OG description",
      path: "/og-test",
    });
    expect(meta.openGraph?.title).toBe("OG Test");
    expect(meta.openGraph?.description).toBe("OG description");
    expect(meta.openGraph?.siteName).toBe("StutterLab");
    expect(meta.openGraph?.type).toBe("website");
  });

  it("includes Twitter card data", () => {
    const meta = createMetadata({
      title: "Twitter Test",
      description: "Twitter desc",
      path: "/twitter-test",
    });
    expect(meta.twitter?.card).toBe("summary_large_image");
    expect(meta.twitter?.title).toBe("Twitter Test");
  });

  it("sets noIndex when requested", () => {
    const meta = createMetadata({
      title: "Hidden",
      description: "Not indexed",
      path: "/hidden",
      noIndex: true,
    });
    expect((meta as Record<string, unknown>).robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("does NOT set noIndex by default", () => {
    const meta = createMetadata({
      title: "Normal",
      description: "Indexed",
      path: "/normal",
    });
    expect((meta as Record<string, unknown>).robots).toBeUndefined();
  });
});

describe("jsonLd", () => {
  it("wraps data with schema.org context", () => {
    const result = jsonLd({ "@type": "WebPage", name: "Test" });
    const parsed = JSON.parse(result.__html);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("WebPage");
    expect(parsed.name).toBe("Test");
  });

  it("outputs valid JSON", () => {
    const result = jsonLd({ "@type": "Organization", url: "https://test.com" });
    expect(() => JSON.parse(result.__html)).not.toThrow();
  });
});

describe("SITE", () => {
  it("has url and name", () => {
    expect(SITE.name).toBe("StutterLab");
    expect(SITE.url).toBeTruthy();
  });
});
