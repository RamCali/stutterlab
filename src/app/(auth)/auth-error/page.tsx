"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "There's a problem with the server configuration. Please try again later.",
  AccessDenied: "Access denied. You may not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Could not start the sign-in process. Please try again.",
  OAuthCallback: "Could not complete the sign-in process. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  EmailCreateAccount: "Could not create your account. Please try again.",
  Callback: "Something went wrong during sign-in. Please try again.",
  OAuthAccountNotLinked: "This email is already associated with another sign-in method.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      <div className="text-center mb-10">
        <Link href="/" className="inline-flex items-center justify-center mb-6">
          <Image src="/logo/StutterLab_Logo.svg" alt="StutterLab" width={320} height={80} className="h-16 w-auto dark:hidden" />
          <Image src="/logo/StutterLab_Logo_white.svg" alt="StutterLab" width={320} height={80} className="h-16 w-auto hidden dark:block" />
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h1 className="text-xl font-semibold">Sign-in Error</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link href="/login">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
