
import { useState } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { TabsContent } from "@/components/ui/tabs";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, DollarSign, FileEdit } from "lucide-react";
import { toast } from "sonner";

// Mock data for user events
const userEvents = [
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
];

// Mock data for user donations
const userDonations = [
  {
    id: "1",
    eventId: "2",
    eventTitle: "Animal Shelter Support",
    amount: 50,
    date: "2025-04-05",
    status: "Completed",
  },
  {
    id: "2",
    eventId: "4",
    eventTitle: "Education for All",
    amount: 100,
    date: "2025-03-22",
    status: "Completed",
  },
  {
    id: "3",
    eventId: "6",
    eventTitle: "Park Revitalization",
    amount: 75,
    date: "2025-02-10",
    status: "Completed",
  },
];

// Mock user profile data
const userProfile = {
  name: "Jane Cooper",
  email: "jane.cooper@example.com",
  phone: "(555) 123-4567",
  address: "123 Main St, Anytown, USA",
  avatar: "https://i.pravatar.cc/150?img=5",
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(userProfile);
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">Your Dashboard</h1>
        
        <DashboardTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        >
          {/* My Events Tab */}
          <TabsContent value="events">
            <h2 className="text-2xl font-heading font-semibold mb-6">My Events</h2>
            
            {userEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't signed up for any events yet. Explore events to volunteer or donate.
                </p>
                <Button asChild>
                  <a href="/">Browse Events</a>
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* My Donations Tab */}
          <TabsContent value="donations">
            <h2 className="text-2xl font-heading font-semibold mb-6">My Donations</h2>
            
            {userDonations.length > 0 ? (
              <div className="space-y-4">
                {userDonations.map((donation) => (
                  <Card key={donation.id}>
                    <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                      <div className="h-12 w-12 rounded-full bg-charity-primary/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-charity-primary" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">${donation.amount}</CardTitle>
                        <CardDescription>Donated to {donation.eventTitle}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span>
                          {new Date(donation.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Status</span>
                        <span className="text-charity-primary font-medium">{donation.status}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button asChild variant="ghost" size="sm" className="ml-auto">
                        <a href={`/event/${donation.eventId}`}>View Event</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No donations yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't made any donations yet. Find a cause you care about to support.
                </p>
                <Button asChild>
                  <a href="/">Browse Causes</a>
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Profile Info Tab */}
          <TabsContent value="profile">
            <h2 className="text-2xl font-heading font-semibold mb-6">Profile Information</h2>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{profileData.name}</CardTitle>
                    <CardDescription>{profileData.email}</CardDescription>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <FileEdit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </CardHeader>
              
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">Save Changes</Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                        <p>{profileData.phone}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                        <p>{profileData.address}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Stats</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-charity-muted">
                          <p className="text-sm text-muted-foreground">Events Joined</p>
                          <p className="text-2xl font-semibold">{userEvents.length}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-charity-muted">
                          <p className="text-sm text-muted-foreground">Total Donated</p>
                          <p className="text-2xl font-semibold">
                            ${userDonations.reduce((sum, donation) => sum + donation.amount, 0)}
                          </p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-charity-muted">
                          <p className="text-sm text-muted-foreground">Member Since</p>
                          <p className="text-2xl font-semibold">2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </DashboardTabs>
      </div>
    </div>
  );
};

export default Dashboard;
