
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {russianContent} from "@/lib/localization/russianContent.ts";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  start_datetime: string;
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
  status: string
}

export const EventCard = ({
  id,
  title,
  description,
  start_datetime,
  location,
  category,
  volunteers,
  donations,
  status,
  image,

}: EventCardProps) => {
  const donationProgress = (donations.raised / donations.goal) * 100;
  const formattedDate = new Date(start_datetime).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusColors: Record<string, string> = {
    upcoming: "bg-green-500 hover:bg-green-600",
    ongoing: "bg-yellow-500 hover:bg-yellow-600",
    completed: "bg-gray-500 hover:bg-gray-600",
    cancelled: "bg-red-500 hover:bg-red-600",
    // fallback
    default: "bg-blue-500 hover:bg-blue-600",
  };


  return (
    <div className="charity-card flex flex-col group">
      <div className="relative h-48 rounded-lg overflow-hidden mb-4">
        <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div style={{position: "absolute", top: "12px", right: "12px"}}>
          <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <Badge style={{position: "relative"}} className="bg-charity-primary hover:bg-charity-primary/90">
              {category}
            </Badge>
              <Badge
                style={{ position: "relative" }}
                className={statusColors[status] || statusColors.default}
              >
                {russianContent.statusTranslations?.[status] || status}
              </Badge>
          </div>
        </div>

      </div>

      <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-1">{title}</h3>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

      <div className="space-y-3 mt-auto">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2"/>
          {formattedDate}
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 mr-2" />
          {location}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          {volunteers.joined}/{volunteers.needed} волонтеров
        </div>
                
        <Button asChild className="w-full mt-4">
          <Link to={`/event/${id}`}>Посмотреть детали</Link>
        </Button>
      </div>
    </div>
  );
};
