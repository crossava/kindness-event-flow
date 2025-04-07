
import { DollarSign, Users, Calendar, Heart } from "lucide-react";

interface StatsOverviewProps {
  totalEvents: number;
  totalVolunteers: number;
  totalDonations: number;
  impactCount: number;
}

export const StatsOverview = ({
  totalEvents,
  totalVolunteers,
  totalDonations,
  impactCount,
}: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="charity-card flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-charity-primary/10 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-charity-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Events</p>
          <p className="text-2xl font-heading font-semibold">{totalEvents}</p>
        </div>
      </div>
      
      <div className="charity-card flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-charity-secondary/30 flex items-center justify-center">
          <Users className="h-6 w-6 text-charity-dark" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Volunteers</p>
          <p className="text-2xl font-heading font-semibold">{totalVolunteers}</p>
        </div>
      </div>
      
      <div className="charity-card flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-charity-accent/30 flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-charity-dark" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Donations</p>
          <p className="text-2xl font-heading font-semibold">${totalDonations.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="charity-card flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-charity-primary/10 flex items-center justify-center">
          <Heart className="h-6 w-6 text-charity-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Lives Impacted</p>
          <p className="text-2xl font-heading font-semibold">{impactCount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
