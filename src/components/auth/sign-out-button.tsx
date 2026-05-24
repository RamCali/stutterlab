"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  variant?: "sidebar" | "button";
  className?: string;
};

export function SignOutButton({ variant = "button", className }: SignOutButtonProps) {
  function handleSignOut() {
    void signOut({ callbackUrl: "/login" });
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
          className
        )}
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        Sign out
      </button>
    );
  }

  return (
    <Button type="button" variant="outline" onClick={handleSignOut} className={className}>
      <LogOut className="h-4 w-4 mr-2" />
      Sign out
    </Button>
  );
}
