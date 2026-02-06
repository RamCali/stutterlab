"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageSquare,
  Trophy,
  HelpCircle,
  BookOpen,
  Heart,
  Headphones,
  UserPlus,
  Plus,
} from "lucide-react";

const forumCategories = [
  { id: "techniques", title: "Techniques", icon: BookOpen, count: 0, description: "Discuss speech techniques that work for you" },
  { id: "wins", title: "Wins & Milestones", icon: Trophy, count: 0, description: "Celebrate your speaking achievements" },
  { id: "support", title: "Support", icon: Heart, count: 0, description: "Get and give encouragement" },
  { id: "qa", title: "Q&A", icon: HelpCircle, count: 0, description: "Ask questions, get answers" },
];

export default function CommunityPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Community
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect with others, find practice partners, and join group sessions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <Tabs defaultValue="forums">
        <TabsList>
          <TabsTrigger value="forums">
            <MessageSquare className="h-4 w-4 mr-1" />
            Forums
          </TabsTrigger>
          <TabsTrigger value="partners">
            <UserPlus className="h-4 w-4 mr-1" />
            Practice Partners
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <Headphones className="h-4 w-4 mr-1" />
            Practice Rooms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forums" className="mt-4 space-y-4">
          {/* Forum Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forumCategories.map((cat) => (
              <Card key={cat.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <cat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{cat.title}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {cat.count} posts
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No posts yet. Be the first to share!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg">Find a Practice Partner</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Get matched with another StutterLab user for live conversation
                  practice. Both of you benefit from real human interaction.
                </p>
                <Button className="mt-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find a Partner
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  <Badge variant="outline" className="text-[10px]">Pro Feature</Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg">Group Practice Rooms</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Join scheduled audio practice sessions with other StutterLab
                  members. Moderated for a safe, supportive environment.
                </p>
                <div className="mt-6 space-y-3 max-w-sm mx-auto">
                  <Card className="border-dashed">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="font-medium text-sm">Weekly Open Practice</p>
                          <p className="text-xs text-muted-foreground">Every Saturday 10am ET</p>
                        </div>
                        <Badge variant="outline">Upcoming</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="font-medium text-sm">Phone Anxiety Group</p>
                          <p className="text-xs text-muted-foreground">Every Wednesday 7pm ET</p>
                        </div>
                        <Badge variant="outline">Upcoming</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
