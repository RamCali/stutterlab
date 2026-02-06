"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Phone,
  Briefcase,
  Coffee,
  GraduationCap,
  ShoppingCart,
  Users,
  MapPin,
  Headphones,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const scenarios = [
  {
    id: "phone-call",
    title: "Phone Call",
    description: "Practice making and receiving phone calls. The AI will call you and you respond naturally.",
    icon: Phone,
    color: "text-red-500",
    bg: "bg-red-500/10",
    difficulty: "Hard",
    isPhoneSimulator: true,
  },
  {
    id: "job-interview",
    title: "Job Interview",
    description: "Practice answering common interview questions. The AI adapts to your field and experience level.",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    difficulty: "Hard",
    isPhoneSimulator: false,
  },
  {
    id: "ordering-food",
    title: "Ordering Food",
    description: "Practice ordering at a restaurant or coffee shop. Start simple and increase complexity.",
    icon: Coffee,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    difficulty: "Medium",
    isPhoneSimulator: false,
  },
  {
    id: "class-presentation",
    title: "Class Presentation",
    description: "Practice giving a presentation. The AI provides an audience with questions.",
    icon: GraduationCap,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    difficulty: "Hard",
    isPhoneSimulator: false,
  },
  {
    id: "small-talk",
    title: "Small Talk",
    description: "Practice casual conversation at a party or social gathering. Natural, flowing dialogue.",
    icon: Users,
    color: "text-green-500",
    bg: "bg-green-500/10",
    difficulty: "Easy",
    isPhoneSimulator: false,
  },
  {
    id: "shopping",
    title: "Shopping / Returns",
    description: "Practice asking for help in a store, returning items, or making complaints.",
    icon: ShoppingCart,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    difficulty: "Medium",
    isPhoneSimulator: false,
  },
  {
    id: "asking-directions",
    title: "Asking for Directions",
    description: "Practice asking strangers for directions and following up with clarifying questions.",
    icon: MapPin,
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
    difficulty: "Easy",
    isPhoneSimulator: false,
  },
  {
    id: "customer-service",
    title: "Customer Service Call",
    description: "Practice calling customer service to resolve an issue. The AI simulates wait times and transfers.",
    icon: Headphones,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    difficulty: "Hard",
    isPhoneSimulator: true,
  },
  {
    id: "meeting-intro",
    title: "Meeting Introduction",
    description: "Practice introducing yourself in a professional meeting or conference.",
    icon: MessageSquare,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    difficulty: "Medium",
    isPhoneSimulator: false,
  },
];

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-500/10 text-green-600",
  Medium: "bg-yellow-500/10 text-yellow-700",
  Hard: "bg-red-500/10 text-red-600",
};

export default function AIPracticePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Conversation Practice
        </h1>
        <p className="text-muted-foreground mt-1">
          Practice real-world speaking scenarios with an AI partner that adapts
          to your fluency level. Not scripted -- every conversation is unique.
        </p>
      </div>

      {/* Phone Call Simulator Banner */}
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/10">
              <Phone className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                Phone Call Simulator
                <Badge variant="secondary" className="text-[10px]">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                The most realistic phone practice available. The AI &ldquo;calls&rdquo; you
                with a ring sound -- pick up and have a natural conversation.
                Designed specifically for phone anxiety.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <Link key={scenario.id} href={`/ai-practice/${scenario.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${scenario.bg} shrink-0`}>
                    <scenario.icon className={`h-5 w-5 ${scenario.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{scenario.title}</h3>
                      {scenario.isPhoneSimulator && (
                        <Badge variant="outline" className="text-[10px]">
                          Phone Sim
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {scenario.description}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`mt-3 text-[10px] ${difficultyColors[scenario.difficulty]}`}
                    >
                      {scenario.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Custom Scenario */}
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold">Create Custom Scenario</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Describe your own feared speaking situation and the AI will create a
            personalized practice scenario just for you.
          </p>
          <Link href="/ai-practice/custom">
            <Badge className="mt-4 cursor-pointer" variant="outline">
              Coming Soon
            </Badge>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
