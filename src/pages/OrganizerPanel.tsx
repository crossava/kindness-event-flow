
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronDown, ListChecks, BarChart3, Plus, Search, Users, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for organizer events
const organizerEvents = [
  {
    id: "1",
    title: "Clean Beach Day",
    description: "Join us for a day of beach cleaning to protect marine life and create a cleaner environment for everyone.",
    date: "2025-05-15",
    location: "Oceanside Beach, CA",
    category: "Environment",
    volunteers: { needed: 50, joined: 32 },
    donations: { goal: 2000, raised: 1250 },
    status: "Active",
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
    status: "Active",
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
    status: "Draft",
  },
];

// Mock data for volunteers
const volunteersData = [
  { id: "1", name: "Jane Cooper", email: "jane@example.com", phone: "(555) 123-4567", event: "Clean Beach Day", joinDate: "2025-03-15" },
  { id: "2", name: "John Smith", email: "john@example.com", phone: "(555) 234-5678", event: "Clean Beach Day", joinDate: "2025-03-16" },
  { id: "3", name: "Emma Wilson", email: "emma@example.com", phone: "(555) 345-6789", event: "Clean Beach Day", joinDate: "2025-03-17" },
  { id: "4", name: "Michael Brown", email: "michael@example.com", phone: "(555) 456-7890", event: "Community Health Fair", joinDate: "2025-03-18" },
  { id: "5", name: "Olivia Davis", email: "olivia@example.com", phone: "(555) 567-8901", event: "Community Health Fair", joinDate: "2025-03-19" },
];

// Mock data for donations
const donationsData = [
  { id: "1", donor: "Anonymous", amount: 50, event: "Clean Beach Day", date: "2025-03-15" },
  { id: "2", name: "Robert Johnson", email: "robert@example.com", amount: 100, event: "Clean Beach Day", date: "2025-03-16" },
  { id: "3", name: "Sarah Williams", email: "sarah@example.com", amount: 75, event: "Community Health Fair", date: "2025-03-17" },
  { id: "4", name: "David Miller", email: "david@example.com", amount: 200, event: "Community Health Fair", date: "2025-03-18" },
  { id: "5", name: "Lisa Garcia", email: "lisa@example.com", amount: 150, event: "Clean Beach Day", date: "2025-03-19" },
];

const OrganizerPanel = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredEvents = organizerEvents.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  const handleCreateEvent = () => {
    setIsCreateEventDialogOpen(false);
    toast.success("Event created successfully!");
  };
  
  // Calculate totals for stats
  const totalEvents = organizerEvents.length;
  const totalVolunteers = organizerEvents.reduce(
    (sum, event) => sum + event.volunteers.joined, 
    0
  );
  const totalDonations = organizerEvents.reduce(
    (sum, event) => sum + event.donations.raised, 
    0
  );
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-heading font-bold">Organizer Panel</h1>
        <Button onClick={() => setIsCreateEventDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Event
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-charity-primary mr-2" />
              <span className="text-2xl font-bold">{totalEvents}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-charity-primary mr-2" />
              <span className="text-2xl font-bold">{totalVolunteers}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-charity-primary mr-2" />
              <span className="text-2xl font-bold">${totalDonations.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Impact Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-charity-primary mr-2" />
              <span className="text-2xl font-bold">{totalVolunteers * 5 + Math.floor(totalDonations / 100)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Events</span>
          </TabsTrigger>
          <TabsTrigger value="volunteers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Volunteers</span>
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Donations</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <CardTitle>My Events</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search events..."
                      className="pl-10 w-full md:w-60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Volunteers</TableHead>
                    <TableHead>Donations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{event.category}</TableCell>
                      <TableCell>
                        {event.volunteers.joined}/{event.volunteers.needed}
                      </TableCell>
                      <TableCell>
                        ${event.donations.raised.toLocaleString()} of ${event.donations.goal.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.status === "Active" 
                            ? "bg-green-100 text-green-700" 
                            : event.status === "Draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {event.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <a href={`/event/${event.id}`} className="w-full">View</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>
                              Manage Volunteers
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              View Donations
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your filters to see more results." 
                      : "You haven't created any events yet."}
                  </p>
                  {(searchQuery || statusFilter !== "all") && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Volunteers Tab */}
        <TabsContent value="volunteers">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <CardTitle>Volunteers</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search volunteers..."
                    className="pl-10 w-full md:w-60"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteersData.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell className="font-medium">{volunteer.name}</TableCell>
                      <TableCell>{volunteer.email}</TableCell>
                      <TableCell>{volunteer.phone}</TableCell>
                      <TableCell>{volunteer.event}</TableCell>
                      <TableCell>
                        {new Date(volunteer.joinDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Contact</DropdownMenuItem>
                            <DropdownMenuItem>Assign Task</DropdownMenuItem>
                            <DropdownMenuItem>Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Donations Tab */}
        <TabsContent value="donations">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <CardTitle>Donations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search donations..."
                    className="pl-10 w-full md:w-60"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donationsData.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">
                        {donation.name || donation.donor}
                      </TableCell>
                      <TableCell>${donation.amount}</TableCell>
                      <TableCell>{donation.event}</TableCell>
                      <TableCell>
                        {new Date(donation.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              {donation.email ? "Send Thank You" : "Record Info"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Event Dialog */}
      <Dialog open={isCreateEventDialogOpen} onOpenChange={setIsCreateEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Charity Event</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new event. You can edit it later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Enter event title" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe your event"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Enter event location" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="poverty">Poverty</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="volunteers">Volunteers Needed</Label>
                <Input id="volunteers" type="number" min="1" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fundraising">Fundraising Goal</Label>
              <Input id="fundraising" type="number" min="0" placeholder="$ Amount" />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateEventDialogOpen(false)}>
              Save as Draft
            </Button>
            <Button type="button" onClick={handleCreateEvent}>
              Publish Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerPanel;
