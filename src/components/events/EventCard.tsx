
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  volunteers: {
    needed: number;
    joined: number;
  };
  donations: {
    goal: number;
    raised: number;
  };
  image: string;
}

export const EventCard = ({
  id,
  title,
  description,
  date,
  location,
  category,
  volunteers,
  donations,
  image,
}: EventCardProps) => {
  const donationProgress = (donations.raised / donations.goal) * 100;
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="charity-card flex flex-col group">
      <div className="relative h-48 rounded-lg overflow-hidden mb-4">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <Badge className="absolute top-3 right-3 bg-charity-primary hover:bg-charity-primary/90">
          {category}
        </Badge>
      </div>
      
      <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="space-y-3 mt-auto">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2" />
          {formattedDate}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {location}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          {volunteers.joined}/{volunteers.needed} volunteers
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>${donations.raised.toLocaleString()}</span>
            <span>${donations.goal.toLocaleString()}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-value" style={{ width: `${donationProgress}%` }} />
          </div>
        </div>
        
        <Button asChild className="w-full mt-4">
          <Link to={`/event/${id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  );
};
