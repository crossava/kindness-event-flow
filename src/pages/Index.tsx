
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { StatsOverview } from "@/components/stats/StatsOverview";

// Mock data for events
const mockEvents = [
  {
    id: "1",
    title: "Clean Beach Day",
    description: "Join us for a day of beach cleaning to protect marine life and create a cleaner environment for everyone.",
    date: "2025-05-15",
    location: "Oceanside Beach, CA",
    category: "Environment",
    volunteers: { needed: 50, joined: 32 },
    donations: { goal: 2000, raised: 1250 },
    image: "https://images.unsplash.com/photo-1626882737796-9be76f8dba86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    title: "Animal Shelter Support",
    description: "Help us provide food, care, and shelter to abandoned animals in need of a loving home.",
    date: "2025-05-22",
    location: "Happy Paws Shelter, NY",
    category: "Animals",
    volunteers: { needed: 30, joined: 18 },
    donations: { goal: 5000, raised: 3200 },
    image: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    title: "Community Health Fair",
    description: "Free health screenings, education, and resources for underserved communities.",
    date: "2025-06-05",
    location: "Central Park, TX",
    category: "Health",
    volunteers: { needed: 40, joined: 25 },
    donations: { goal: 7500, raised: 4000 },
    image: "https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    title: "Education for All",
    description: "Providing school supplies and tutoring for children in low-income neighborhoods.",
    date: "2025-06-12",
    location: "Riverside Elementary, IL",
    category: "Education",
    volunteers: { needed: 25, joined: 20 },
    donations: { goal: 3000, raised: 2800 },
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    title: "Homeless Feeding Program",
    description: "Help prepare and distribute meals to the homeless in our community.",
    date: "2025-06-18",
    location: "Downtown Shelter, WA",
    category: "Poverty",
    volunteers: { needed: 35, joined: 15 },
    donations: { goal: 4000, raised: 1500 },
    image: "https://images.unsplash.com/photo-1588188578164-acb97570a368?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    title: "Park Revitalization",
    description: "Plant trees, install benches, and beautify our local park for everyone to enjoy.",
    date: "2025-06-25",
    location: "Greenfield Park, OR",
    category: "Community",
    volunteers: { needed: 45, joined: 30 },
    donations: { goal: 6000, raised: 3500 },
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
];

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredEvents = mockEvents.filter((event) => {
    const matchesCategory = selectedCategory === "all" || 
      event.category.toLowerCase() === selectedCategory;
    
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Calculate totals for stats
  const totalEvents = mockEvents.length;
  const totalVolunteers = mockEvents.reduce(
    (sum, event) => sum + event.volunteers.joined, 
    0
  );
  const totalDonations = mockEvents.reduce(
    (sum, event) => sum + event.donations.raised, 
    0
  );
  
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Make a Difference Today
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Connect with meaningful causes, volunteer your time, and donate to create positive change in communities around the world.
          </p>
          <Button asChild size="lg">
            <Link to="/organizer">Create Event</Link>
          </Button>
        </div>
        
        <StatsOverview 
          totalEvents={totalEvents}
          totalVolunteers={totalVolunteers}
          totalDonations={totalDonations}
          impactCount={totalVolunteers * 3}
        />
      </section>
      
      <section>
        <h2 className="text-2xl font-heading font-semibold mb-6">
          Upcoming Charity Events
        </h2>
        
        <EventFilters 
          onCategoryChange={setSelectedCategory}
          onSearch={setSearchQuery}
          selectedCategory={selectedCategory}
        />
        
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No events found matching your criteria.</p>
            <Button variant="outline" onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
