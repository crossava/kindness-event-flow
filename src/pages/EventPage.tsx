
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Heart, 
  Share2, 
  DollarSign 
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Mock data for event details
const mockEvent = {
  id: "1",
  title: "Clean Beach Day",
  description: "Join us for a day of beach cleaning to protect marine life and create a cleaner environment for everyone. This initiative aims to remove plastic and other pollutants from our shores, educate participants about marine conservation, and foster a sense of community responsibility for our natural resources. All supplies will be provided, including gloves, trash bags, and refreshments. Families are welcome, and children must be accompanied by an adult.",
  date: "2025-05-15T10:00:00",
  endDate: "2025-05-15T15:00:00",
  location: "Oceanside Beach, CA",
  address: "123 Oceanview Dr, Oceanside, CA 92054",
  category: "Environment",
  organizer: "Ocean Conservation Society",
  volunteers: { needed: 50, joined: 32 },
  donations: { goal: 2000, raised: 1250 },
  image: "https://images.unsplash.com/photo-1626882737796-9be76f8dba86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
};

const EventPage = () => {
  const { id } = useParams();
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("25");
  
  // In a real app, fetch event by ID from API
  const event = mockEvent;
  
  const donationProgress = (event.donations.raised / event.donations.goal) * 100;
  
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  const formattedTime = `${new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${new Date(event.endDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const handleVolunteerSubmit = () => {
    setIsVolunteerDialogOpen(false);
    toast.success("Thank you for volunteering! The organizer will contact you soon.");
  };

  const handleDonateSubmit = () => {
    setIsDonateDialogOpen(false);
    toast.success(`Thank you for your $${donationAmount} donation!`);
  };

  const handleShare = () => {
    // In a real app, implement share functionality
    toast.success("Event link copied to clipboard!");
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl overflow-hidden h-80 mb-8">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-heading font-bold mb-4">{event.title}</h1>
            <p className="text-muted-foreground mb-6">{event.description}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-3 text-charity-primary" />
                <div>
                  <p className="font-medium">{formattedDate}</p>
                  <p className="text-sm text-muted-foreground">{formattedTime}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-charity-primary" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-muted-foreground">{event.address}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-charity-primary" />
                <div>
                  <p className="font-medium">Organized by {event.organizer}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.volunteers.joined} of {event.volunteers.needed} volunteers joined
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="charity-card flex flex-col space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>${event.donations.raised.toLocaleString()}</span>
                <span>of ${event.donations.goal.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-value" 
                  style={{ width: `${donationProgress}%` }} 
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(donationProgress)}% towards our goal
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant="default"
                onClick={() => setIsDonateDialogOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Donate
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setIsVolunteerDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Join as Volunteer
              </Button>
              
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Volunteer Dialog */}
      <Dialog open={isVolunteerDialogOpen} onOpenChange={setIsVolunteerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Volunteer for {event.title}</DialogTitle>
            <DialogDescription>
              Fill in your details to sign up as a volunteer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Enter your phone number" />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleVolunteerSubmit}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Donate Dialog */}
      <Dialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donate to {event.title}</DialogTitle>
            <DialogDescription>
              Your contribution helps make this event possible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount</Label>
              <div className="flex space-x-2">
                {["10", "25", "50", "100"].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={donationAmount === amount ? "default" : "outline"}
                    onClick={() => setDonationAmount(amount)}
                    className="flex-1"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <Input
                id="amount"
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="mt-2"
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card">Card Information</Label>
              <Input id="card" placeholder="Card number" />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleDonateSubmit}>
              Donate ${donationAmount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventPage;
