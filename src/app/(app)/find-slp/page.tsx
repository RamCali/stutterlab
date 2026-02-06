"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Stethoscope,
  Search,
  MapPin,
  Star,
  Video,
  Clock,
  ChevronRight,
} from "lucide-react";

const sampleSLPs = [
  {
    name: "Dr. Sarah Chen, CCC-SLP",
    specialties: ["Adult Stuttering", "Fluency Shaping", "CBT"],
    location: "San Francisco, CA",
    rating: 4.9,
    reviews: 24,
    hourlyRate: 120,
    availability: "Available this week",
    telehealth: true,
    avatar: "SC",
  },
  {
    name: "James Rodriguez, M.S., CCC-SLP",
    specialties: ["Stuttering Modification", "DAF Therapy", "Acceptance-Based"],
    location: "Austin, TX",
    rating: 4.8,
    reviews: 18,
    hourlyRate: 100,
    availability: "Available next week",
    telehealth: true,
    avatar: "JR",
  },
  {
    name: "Dr. Maya Patel, Ph.D., CCC-SLP",
    specialties: ["Neurogenic Stuttering", "Cluttering", "Research-Based"],
    location: "New York, NY",
    rating: 5.0,
    reviews: 31,
    hourlyRate: 150,
    availability: "Waitlist (2 weeks)",
    telehealth: true,
    avatar: "MP",
  },
];

export default function FindSLPPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          Find an SLP
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect with Speech-Language Pathologists who specialize in stuttering treatment
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, specialty, or location..." className="pl-10" />
            </div>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Near Me
            </Button>
            <Button variant="outline">
              <Video className="h-4 w-4 mr-2" />
              Telehealth Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SLP Listings */}
      <div className="space-y-4">
        {sampleSLPs.map((slp) => (
          <Card key={slp.name} className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {slp.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{slp.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{slp.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({slp.reviews} reviews)
                          </span>
                        </div>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {slp.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">${slp.hourlyRate}/hr</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {slp.availability}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {slp.specialties.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-[10px]">
                        {spec}
                      </Badge>
                    ))}
                    {slp.telehealth && (
                      <Badge variant="outline" className="text-[10px]">
                        <Video className="h-2.5 w-2.5 mr-1" />
                        Telehealth
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm">
                      Connect
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button size="sm" variant="outline">View Profile</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Are you an SLP? */}
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Stethoscope className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold">Are you an SLP?</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Join StutterLab as a clinician. Manage patients, prescribe exercises,
            conduct telehealth sessions, and grow your practice.
          </p>
          <Button className="mt-4" variant="outline">
            Apply as SLP
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
