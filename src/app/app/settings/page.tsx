"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface SettingsPageProps {
  searchParams: Promise<{ upgraded?: string }>;
}

export default function SettingsPage({ searchParams: _searchParams }: SettingsPageProps) {
  const [displayName, setDisplayName] = useState("");
  const [email] = useState("");
  const [bio, setBio] = useState("");
  const [severity, setSeverity] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  // TODO: Fetch from server — hardcoded for now
  const [currentPlan] = useState<"free" | "pro">("free");

  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyProgress: true,
    newExercises: true,
  });

  async function handleUpgrade() {
    setSubLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setSubLoading(false);
    }
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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
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
        <CardContent>
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
    </div>
  );
}
