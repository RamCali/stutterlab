import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection({
  title = "Ready to Transform Your Speech?",
  description = "Join thousands taking control of their fluency with evidence-based tools and AI-powered practice. Start your free trial today.",
  primaryCta = "Start Free Trial",
  primaryHref = "/signup",
}: {
  title?: string;
  description?: string;
  primaryCta?: string;
  primaryHref?: string;
}) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {description}
        </p>
        <Button size="lg" className="mt-8 px-10" asChild>
          <Link href={primaryHref}>
            {primaryCta}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          No credit card required. Free tier available forever.
        </p>
      </div>
    </section>
  );
}
