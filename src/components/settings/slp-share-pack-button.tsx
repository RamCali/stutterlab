"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { generateSlpSharePackPDF } from "@/components/slp/SlpSharePackPDF";
import type { SlpSharePackData } from "@/lib/slp/build-share-pack";

export function SlpSharePackButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/slp-export");
      if (!res.ok) throw new Error("Export failed");
      const data = (await res.json()) as SlpSharePackData;
      generateSlpSharePackPDF(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading} className="gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      Download SLP share pack (PDF)
    </Button>
  );
}
