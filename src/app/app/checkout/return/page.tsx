"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type SessionStatus = "loading" | "complete" | "open" | "error";

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/stripe/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status === "complete" ? "complete" : "open");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to Premium!</h1>
            <p className="text-muted-foreground">
              Your subscription is active. You now have full access to all
              premium features including AI coaching, advanced analytics, and
              personalized training plans.
            </p>
            <Button onClick={() => router.push("/app/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t confirm your payment. Please try again or contact
            support if the issue persists.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/app/dashboard")}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}
