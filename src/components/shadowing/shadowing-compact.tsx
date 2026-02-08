"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Mic, Users } from "lucide-react";

/** Compact dashboard widget linking to the Shadowing Challenge page */
export function ShadowingChallengeCompact() {
  return (
    <Link href="/shadowing">
      <Card className="hover:border-primary/50 transition-colors cursor-pointer border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Shadowing Challenge</p>
                <Badge className="text-[8px] bg-[#00E676]/10 text-[#00E676]">NEW</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Shadow SLP echo clips &amp; get scored by AI
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
              <Users className="h-3 w-3" />
              1.7k today
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
