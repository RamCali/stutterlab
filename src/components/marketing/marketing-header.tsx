import Link from "next/link";
import { AudioWaveform } from "lucide-react";
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
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <AudioWaveform className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">StutterLab</span>
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
