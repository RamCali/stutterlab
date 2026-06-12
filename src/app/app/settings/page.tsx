"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { EmbeddedCheckoutDialog } from "@/components/embedded-checkout";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ResearchParticipationSettings } from "@/components/settings/research-participation";
import { CommunicationsConsentSettings } from "@/components/settings/communications-consent-settings";
import { NotificationPrefsSettings } from "@/components/settings/notification-prefs-settings";
import { SlpSharePackButton } from "@/components/settings/slp-share-pack-button";
import { trackProductEvent } from "@/lib/analytics/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  Download,
  Trash2,
  Check,
  Loader2,
  Crown,
  ExternalLink,
  LifeBuoy,
  Send,
  Calendar,
  FileDown,
  MessageCircle,
  ClipboardList,
  Flame,
  Mic,
} from "lucide-react";

type UserStats = {
  currentStreak: number;
  totalExercisesCompleted: number;
  totalPracticeSeconds: number;
  currentDay: number;
};

const cancellationReasons = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "not_using", label: "Not using it enough" },
  { value: "not_enough_progress", label: "Did not see enough progress" },
  { value: "technical_issue", label: "Technical issue" },
  { value: "found_another_solution", label: "Found another solution" },
  { value: "no_longer_needed", label: "No longer need speech practice" },
  { value: "other", label: "Other" },
];

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email] = useState("");
  const [bio, setBio] = useState("");
  const [severity, setSeverity] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [cancelAcknowledgements, setCancelAcknowledgements] = useState({
    stripe: false,
    access: false,
    data: false,
  });
  const [supportReason, setSupportReason] = useState<
    "billing_question" | "refund_request" | "suspicious_charge"
  >("refund_request");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [supportError, setSupportError] = useState("");
  const [smsSetupStatus, setSmsSetupStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [smsSetupMessage, setSmsSetupMessage] = useState("");

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data?.isPremium) setCurrentPlan("pro");
        if (data?.stats) {
          setStats({
            currentStreak: data.stats.currentStreak ?? 0,
            totalExercisesCompleted: data.stats.totalExercisesCompleted ?? 0,
            totalPracticeSeconds: data.stats.totalPracticeSeconds ?? 0,
            currentDay: data.stats.currentDay ?? 1,
          });
        }
      })
      .catch(() => {});
  }, []);


  function handleUpgrade() {
    setCheckoutOpen(true);
  }

  async function sendSmsSetupText(phoneNumber: string) {
    if (!phoneNumber || smsSetupStatus === "sending") return;

    setSmsSetupStatus("sending");
    setSmsSetupMessage("");

    try {
      const res = await fetch("/api/sms/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not send the setup text yet.");
      }

      setSmsSetupStatus("sent");
      setSmsSetupMessage(
        data.fromNumber
          ? `Setup text sent. Save ${data.fromNumber} as StutterLab.`
          : "Setup text sent. Save the sender as StutterLab."
      );
    } catch (error) {
      setSmsSetupStatus("error");
      setSmsSetupMessage(
        error instanceof Error ? error.message : "Could not send the setup text yet."
      );
    }
  }

  function openCancellationFlow() {
    setCancelStep(1);
    setCancelDialogOpen(true);
    setSubError("");
  }

  async function handleManageSubscription() {
    setSubLoading(true);
    setSubError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (!res.ok || !url) throw new Error(error || "Could not open billing portal");
      if (url) window.location.href = url;
    } catch (err) {
      setSubError(
        err instanceof Error
          ? err.message
          : "Could not open billing portal. Contact support if this continues."
      );
    } finally {
      setSubLoading(false);
    }
  }

  async function handleContinueToStripeCancellation() {
    trackProductEvent("subscription_cancellation_portal_opened", {
      reason: cancelReason,
      feedback: cancelFeedback.trim() || undefined,
      currentStreak: stats?.currentStreak ?? 0,
      totalExercisesCompleted: stats?.totalExercisesCompleted ?? 0,
      totalPracticeSeconds: stats?.totalPracticeSeconds ?? 0,
      currentDay: stats?.currentDay ?? 1,
    });
    await handleManageSubscription();
  }

  function handleCancelDialogOpenChange(open: boolean) {
    setCancelDialogOpen(open);
    if (!open) {
      setCancelStep(1);
      setCancelAcknowledgements({ stripe: false, access: false, data: false });
    }
  }

  function requestPauseSupport() {
    setSupportReason("billing_question");
    setSupportMessage(
      "I am considering canceling and would like help pausing or adjusting my StutterLab plan."
    );
    setCancelDialogOpen(false);
    requestAnimationFrame(() => {
      document
        .getElementById("billing-support-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleSaveProfile() {
    setSaving(true);
    // Will call updateProfile() server action when DB is connected
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleBillingSupport() {
    setSupportStatus("sending");
    setSupportError("");
    try {
      const res = await fetch("/api/billing/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: supportReason,
          message: supportMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send request");
      setSupportStatus("sent");
      setSupportMessage("");
    } catch (err) {
      setSupportStatus("error");
      setSupportError(
        err instanceof Error
          ? err.message
          : "Please email support@stutterlab.com and we will review it."
      );
    }
  }

  const practiceMinutes = Math.round((stats?.totalPracticeSeconds ?? 0) / 60);
  const allCancelAcknowledged = Object.values(cancelAcknowledgements).every(Boolean);
  const selectedCancelReason = cancellationReasons.find(
    (reason) => reason.value === cancelReason
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" />
          Settings
        </h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Display Name</Label>
              <Input
                placeholder="Your name"
                className="mt-1"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                placeholder="you@example.com"
                className="mt-1"
                value={email}
                disabled
              />
            </div>
          </div>
          <div>
            <Label>Bio</Label>
            <Input
              placeholder="A short bio about yourself (optional)"
              className="mt-1"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div>
            <Label>Stuttering Severity</Label>
            <div className="flex gap-2 mt-1">
              {(["mild", "moderate", "severe"] as const).map((level) => (
                <Button
                  key={level}
                  variant={severity === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeverity(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

          <div className="border-t border-border/60 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Speech profile</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View and update everything you shared during onboarding — severity, fears,
                  goals, therapy history, and more.
                </p>
              </div>
              <Link href="/speech-profile">
                <Button variant="outline" size="sm">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  View profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4">
            <SignOutButton />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommunicationsConsentSettings
            onSmsSetup={sendSmsSetupText}
            smsSetupStatus={smsSetupStatus}
            smsSetupMessage={smsSetupMessage}
          />
          <NotificationPrefsSettings />
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <Badge className={`mt-1 ${currentPlan === "pro" ? "bg-primary" : ""}`}>
                {currentPlan === "pro" ? "Pro" : "Free"}
              </Badge>
            </div>
            {currentPlan === "pro" ? (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={subLoading}
                >
                  {subLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Billing
                </Button>
                <Button
                  variant="outline"
                  onClick={openCancellationFlow}
                  disabled={subLoading}
                >
                  Cancel Subscription
                </Button>
              </div>
            ) : (
              <Button onClick={handleUpgrade} disabled={subLoading}>
                {subLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Upgrade to Pro
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {currentPlan === "pro"
              ? "You have full access to all StutterLab features. Use Manage Billing to update payment details, invoices, or plan settings in Stripe."
              : "Start your 7-day free trial to unlock all features — daily guided practice, AI simulators, clinical assessments, and more."}
          </p>
          {subError && <p className="text-sm text-destructive">{subError}</p>}
          <div id="billing-support-section" className="border-t pt-5">
            <div className="flex items-start gap-3">
              <LifeBuoy className="mt-0.5 h-4 w-4 text-primary" />
              <div className="flex-1 space-y-4">
                <div>
                  <p className="font-medium">Billing support</p>
                  <p className="text-xs text-muted-foreground">
                    Refund requests and suspicious charges go straight to the
                    StutterLab support queue with your billing context attached.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                  <div>
                    <Label htmlFor="billing-reason">Reason</Label>
                    <select
                      id="billing-reason"
                      value={supportReason}
                      onChange={(e) =>
                        setSupportReason(
                          e.target.value as
                            | "billing_question"
                            | "refund_request"
                            | "suspicious_charge"
                        )
                      }
                      className="border-input bg-background mt-1 h-9 w-full rounded-md border px-3 text-sm"
                    >
                      <option value="refund_request">Refund request</option>
                      <option value="suspicious_charge">Suspicious charge</option>
                      <option value="billing_question">Billing question</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="billing-message">What happened?</Label>
                    <Textarea
                      id="billing-message"
                      className="mt-1 min-h-24"
                      placeholder="Include the charge date, amount, or anything that looked unfamiliar."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                    />
                  </div>
                </div>
                {supportStatus === "sent" && (
                  <p className="text-sm text-emerald-600">
                    Sent. Support will review the charge and follow up by email.
                  </p>
                )}
                {supportStatus === "error" && (
                  <p className="text-sm text-destructive">{supportError}</p>
                )}
                <Button
                  variant="outline"
                  onClick={handleBillingSupport}
                  disabled={supportStatus === "sending" || supportMessage.trim().length < 10}
                >
                  {supportStatus === "sending" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send to Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card id="privacy-data-section">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResearchParticipationSettings />
          <SlpSharePackButton />

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                document
                  .getElementById("research-consent")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
      <EmbeddedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        interval="year"
      />
      <Dialog open={cancelDialogOpen} onOpenChange={handleCancelDialogOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          {cancelStep === 1 ? (
            <>
              <DialogHeader className="text-center">
                <DialogTitle className="text-2xl">Before You Cancel</DialogTitle>
                <DialogDescription>
                  Your plan keeps your practice tools, saved progress, and progress
                  history connected in one place.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Practice sessions",
                    value: stats?.totalExercisesCompleted ?? 0,
                    icon: ClipboardList,
                  },
                  {
                    label: "Practice minutes",
                    value: practiceMinutes,
                    icon: Mic,
                  },
                  {
                    label: "Current streak",
                    value: stats?.currentStreak ?? 0,
                    icon: Flame,
                  },
                  {
                    label: "Practice streak (days)",
                    value: stats?.currentDay ?? 1,
                    icon: Calendar,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border p-4">
                    <item.icon className="mb-3 h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 border-y py-5 md:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  <h3 className="font-semibold">Ways we can help</h3>
                  <p className="text-sm text-muted-foreground">
                    If the timing is off, we can help pause, simplify, or review
                    your plan before you leave.
                  </p>
                  <div className="grid gap-2">
                    <Button variant="outline" onClick={requestPauseSupport}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Ask About Pausing
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSupportReason("billing_question");
                        setSupportMessage(
                          "I am considering canceling and would like help making my StutterLab practice plan simpler."
                        );
                        setCancelDialogOpen(false);
                        requestAnimationFrame(() => {
                          document
                            .getElementById("billing-support-section")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        });
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Get Plan Help
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCancelDialogOpen(false);
                        document
                          .getElementById("privacy-data-section")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export Progress First
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancel-reason">Cancellation reason</Label>
                    <select
                      id="cancel-reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="border-input bg-background mt-1 h-10 w-full rounded-md border px-3 text-sm"
                    >
                      <option value="">Select a reason</option>
                      {cancellationReasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="cancel-feedback">What could be better?</Label>
                    <Textarea
                      id="cancel-feedback"
                      value={cancelFeedback}
                      maxLength={300}
                      onChange={(e) => setCancelFeedback(e.target.value)}
                      placeholder="Optional, but it helps us improve StutterLab."
                      className="mt-1 min-h-28"
                    />
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      {cancelFeedback.length}/300
                    </p>
                  </div>
                  {cancelReason === "not_enough_progress" && (
                    <p className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                      Progress can be uneven. Support can help turn your history
                      into a shorter 7-day reset plan.
                    </p>
                  )}
                  {cancelReason === "technical_issue" && (
                    <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      Technical issues should not cost you practice time. Send the
                      details in Billing support and we will review it.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                  Keep My Plan
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setCancelStep(2)}
                  disabled={!cancelReason}
                >
                  Continue to Cancel
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="text-center">
                <DialogTitle className="text-2xl">Confirm Cancellation</DialogTitle>
                <DialogDescription>
                  StutterLab will open Stripe so you can securely finish the
                  cancellation. Selected reason:{" "}
                  {selectedCancelReason?.label.toLowerCase() ?? "not specified"}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 border-y py-5">
                {[
                  {
                    key: "stripe" as const,
                    text: "I understand cancellation is completed securely in Stripe.",
                  },
                  {
                    key: "access" as const,
                    text: "I understand my subscription access remains active until the end of the current billing period when applicable.",
                  },
                  {
                    key: "data" as const,
                    text: "I understand my practice history and recordings follow StutterLab's data retention policy unless I delete or export my data separately.",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4"
                      checked={cancelAcknowledgements[item.key]}
                      onChange={(e) =>
                        setCancelAcknowledgements((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                    />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>

              {subError && <p className="text-sm text-destructive">{subError}</p>}

              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelStep(1)}>
                  Back
                </Button>
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                  Keep My Plan
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleContinueToStripeCancellation}
                  disabled={!allCancelAcknowledged || subLoading}
                >
                  {subLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cancel in Stripe
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
