import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/stuttering-treatment", label: "Treatment" },
  { href: "/stuttering-exercises", label: "Exercises" },
  { href: "/ai-stuttering-therapy", label: "AI Therapy" },
  { href: "/blog", label: "Blog" },
  { href: "/#pricing", label: "Pricing" },
];

export function MarketingHeader() {
  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo/StutterLab_Logo.svg" alt="StutterLab" width={200} height={50} className="h-10 w-auto dark:hidden" />
          <Image src="/logo/StutterLab_Logo_white.svg" alt="StutterLab" width={200} height={50} className="h-10 w-auto hidden dark:block" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
