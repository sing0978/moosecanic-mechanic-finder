import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, List, Wrench, Star, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import ServiceCategory from "@/components/ServiceCategory";
import MechanicCard from "@/components/MechanicCard";
import MechanicMap from "@/components/MechanicMap";
import heroImage from "@/assets/hero-mechanic.jpg";
import { serviceCategories, mockMechanics } from "@/data/mockData";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const handleFindMechanics = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLoading(false);
        
        // Scroll to results section
        const resultsSection = document.querySelector('#results-section');
        resultsSection?.scrollIntoView({ behavior: 'smooth' });
        
        toast({
          title: "Location found!",
          description: `Showing mechanics near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
      },
      (error) => {
        setLoading(false);
        let message = "Unable to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const filteredMechanics = selectedCategory === "All" 
    ? mockMechanics 
    : mockMechanics.filter(mechanic => 
        mechanic.specialties.some(specialty => 
          specialty.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(specialty.toLowerCase())
        )
      );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-glow/60" />
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Trusted Mechanics
              <span className="block text-primary-glow">Near You</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Connect with verified automotive professionals in your area. 
              Compare services, read reviews, and book appointments instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-8"
                onClick={handleFindMechanics}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5 mr-2" />
                )}
                {loading ? "Finding Mechanics..." : "Find Mechanics Now"}
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                <Wrench className="w-5 h-5 mr-2" />
                Join as Mechanic
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-0 shadow-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Verified Mechanics</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-accent mb-2">24/7</div>
              <p className="text-muted-foreground">Emergency Service</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">4.8★</div>
              <p className="text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
        </section>

        {/* Search & Filters */}
        <Card id="results-section" className="mb-8 bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Find Mechanics Near You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceCategory 
              categories={serviceCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Found {filteredMechanics.length} mechanics
                {selectedCategory !== "All" && ` for ${selectedCategory}`}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Map
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {viewMode === "map" ? (
          <MechanicMap />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMechanics.map((mechanic) => (
              <MechanicCard key={mechanic.id} mechanic={mechanic} />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="bg-gradient-hero border-0 shadow-elegant text-primary-foreground">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust Moosecanic 
                for all their automotive needs.
              </p>
              <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-lg px-8">
                Download Mobile App
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
