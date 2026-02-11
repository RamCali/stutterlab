"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Stethoscope,
  Search,
  MapPin,
  Star,
  Video,
  ExternalLink,
  Crown,
} from "lucide-react";

const sampleSLPs = [
  {
    name: "Dr. Sarah Chen, CCC-SLP",
    specialty: "Stuttering & Cluttering",
    location: "San Francisco, CA",
    rating: 4.9,
    reviews: 47,
    telehealth: true,
    inPerson: true,
    bio: "15+ years specializing in stuttering therapy for adults. Certified in Camperdown and Lidcombe programs.",
  },
  {
    name: "Dr. Michael Torres, CCC-SLP",
    specialty: "Fluency Disorders",
    location: "New York, NY",
    rating: 4.8,
    reviews: 62,
    telehealth: true,
    inPerson: false,
    bio: "Specializes in stuttering modification and desensitization approaches. Telehealth only.",
  },
  {
    name: "Dr. Emily Park, CCC-SLP",
    specialty: "Stuttering & Anxiety",
    location: "Austin, TX",
    rating: 4.7,
    reviews: 33,
    telehealth: true,
    inPerson: true,
    bio: "Combines fluency shaping with CBT for holistic stuttering treatment. ASHA Board Certified Specialist.",
  },
  {
    name: "Dr. James Wright, CCC-SLP",
    specialty: "Adult Fluency",
    location: "Chicago, IL",
    rating: 4.9,
    reviews: 28,
    telehealth: true,
    inPerson: true,
    bio: "Former person who stutters. Passionate about helping adults achieve their communication goals.",
  },
];

export default function FindSLPPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          Find an SLP
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect with Speech-Language Pathologists who specialize in stuttering
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, location, or specialty..." className="pl-9" />
      </div>

      {/* Telehealth CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Telehealth Sessions</p>
              <p className="text-xs text-muted-foreground">
                Connect with your SLP via video call directly within StutterLab. Share your progress data automatically.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] flex-shrink-0">
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* SLP List */}
      <div className="space-y-4">
        {sampleSLPs.map((slp) => (
          <Card key={slp.name} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-sm">{slp.name}</h3>
                  <p className="text-xs text-muted-foreground">{slp.specialty}</p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{slp.rating}</span>
                  <span className="text-muted-foreground">({slp.reviews})</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{slp.bio}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    <MapPin className="h-2.5 w-2.5 mr-0.5" />
                    {slp.location}
                  </Badge>
                  {slp.telehealth && (
                    <Badge variant="secondary" className="text-[10px]">
                      <Video className="h-2.5 w-2.5 mr-0.5" />
                      Telehealth
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        All listed SLPs hold CCC-SLP certification and specialize in fluency disorders.
      </p>
    </div>
  );
}
