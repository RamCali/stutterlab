"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  Download,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
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
              <Input placeholder="Your name" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input placeholder="you@example.com" className="mt-1" disabled />
            </div>
          </div>
          <div>
            <Label>Bio</Label>
            <Input placeholder="A short bio about yourself (optional)" className="mt-1" />
          </div>
          <Button>Save Changes</Button>
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
          {[
            { label: "Daily practice reminders", description: "Get reminded to practice each day" },
            { label: "Weekly progress summary", description: "Receive a weekly report of your progress" },
            { label: "Community activity", description: "Notifications for replies and mentions" },
            { label: "New exercise alerts", description: "Know when new exercises are added" },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{setting.label}</p>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
              <Switch />
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
              <Badge className="mt-1">Free</Badge>
            </div>
            <Button>Upgrade to Pro</Button>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show profile in community</p>
              <p className="text-xs text-muted-foreground">Allow others to see your practice stats</p>
            </div>
            <Switch />
          </div>
          <Separator />
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
