"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import { notFoundQuotes } from "@/lib/404-quotes";

export default function NotFound() {
  const [quote, setQuote] = useState(notFoundQuotes[0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(notFoundQuotes[Math.floor(Math.random() * notFoundQuotes.length)]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
      <Link href="/" className="mb-10">
        <Image
          src="/logo/StutterLab_Logo.svg"
          alt="StutterLab"
          width={240}
          height={48}
          className="h-12 w-auto dark:hidden"
        />
        <Image
          src="/logo/StutterLab_Logo_white.svg"
          alt="StutterLab"
          width={240}
          height={48}
          className="h-12 w-auto hidden dark:block"
        />
      </Link>

      <div className="text-center max-w-md space-y-6">
        <p className="text-7xl font-bold text-primary/20">404</p>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Wrong turn — not a wrong step.
          </h1>
          <p className="text-muted-foreground text-base">
            This page doesn&apos;t exist, but your progress does.
          </p>
        </div>

        <blockquote className="border-l-2 border-primary/40 pl-4 py-2 text-left">
          <p className="text-sm italic text-foreground/80">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {quote.subtext}
          </p>
        </blockquote>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild>
            <Link href="/app/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/app/practice">
              Start Practicing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
