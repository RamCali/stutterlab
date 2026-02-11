import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { href: "/stuttering-treatment", label: "Treatment" },
    { href: "/stuttering-therapy-app", label: "Therapy App" },
    { href: "/stuttering-exercises", label: "Exercises" },
    { href: "/ai-stuttering-therapy", label: "AI Therapy" },
    { href: "/#pricing", label: "Pricing" },
  ],
  Resources: [
    { href: "/blog", label: "Blog" },
    { href: "/speech-therapy-for-stuttering", label: "Speech Therapy Guide" },
    { href: "/#for-slps", label: "For SLPs" },
  ],
  Company: [
    { href: "/login", label: "Log In" },
    { href: "/signup", label: "Sign Up" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 py-12 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center">
              <Image src="/logo/StutterLab_Logo.svg" alt="StutterLab" width={160} height={40} className="h-8 w-auto dark:hidden" />
              <Image src="/logo/StutterLab_Logo_white.svg" alt="StutterLab" width={160} height={40} className="h-8 w-auto hidden dark:block" />
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Evidence-based stuttering treatment, powered by AI, accessible
              from any browser.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StutterLab. All rights reserved.</p>
          <p>
            StutterLab is not a substitute for professional diagnosis or
            treatment. Always consult a qualified SLP.
          </p>
        </div>
      </div>
    </footer>
  );
}
