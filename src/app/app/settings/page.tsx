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
} from "lucide-react";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email] = useState("");
  const [bio, setBio] = useState("");
  const [severity, setSeverity] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [supportReason, setSupportReason] = useState<
    "billing_question" | "refund_request" | "suspicious_charge"
  >("refund_request");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [supportError, setSupportError] = useState("");

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data?.isPremium) setCurrentPlan("pro");
      })
      .catch(() => {});
  }, []);

  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyProgress: true,
    newExercises: true,
  });

  function handleUpgrade() {
    setCheckoutOpen(true);
  }

  async function handleManageSubscription() {
    setSubLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setSubLoading(false);
    }
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
          {([
            { key: "dailyReminders" as const, label: "Daily practice reminders", description: "Get reminded to practice each day" },
            { key: "weeklyProgress" as const, label: "Weekly progress summary", description: "Receive a weekly report of your progress" },
            { key: "newExercises" as const, label: "New exercise alerts", description: "Know when new exercises are added" },
          ]).map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{setting.label}</p>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
              <Switch
                checked={notifications[setting.key]}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [setting.key]: checked }))
                }
              />
            </div>
          ))}
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
                Manage Subscription
              </Button>
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
              ? "You have full access to all StutterLab features."
              : "Start your 7-day free trial to unlock all features — daily guided practice, AI simulators, clinical assessments, and more."}
          </p>
          <div className="border-t pt-5">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
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
    </div>
  );
}
