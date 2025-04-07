
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, DollarSign, Mail } from "lucide-react";
import { useState } from "react";
import { russianContent } from "@/lib/localization/russianContent";
import { toast } from "sonner";

interface Donation {
  id: string;
  donor: string;
  name?: string;
  email?: string;
  amount: number;
  event: string;
  date: string;
}

interface DonationViewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  donations: Donation[];
}

export const DonationViewForm = ({
  open,
  onOpenChange,
  eventTitle,
  donations,
}: DonationViewFormProps) => {
  const { donations: don, common } = russianContent;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDonations = donations.filter(
    (donation) =>
      (donation.name && donation.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (donation.donor && donation.donor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (donation.email && donation.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);

  const handleSendThankYou = (email: string) => {
    toast.success(`Благодарственное письмо отправлено на ${email}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {common.view} {common.donations}: {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="bg-muted p-3 rounded-md flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-charity-primary" />
              <div>
                <p className="text-sm font-medium">{don.amount}</p>
                <p className="text-2xl font-bold">₽{totalDonated.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={`${common.search} ${common.donations.toLowerCase()}...`}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{don.donor}</TableHead>
                <TableHead>{don.amount}</TableHead>
                <TableHead>{don.date}</TableHead>
                <TableHead>{common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">
                    {donation.name || donation.donor}
                    {donation.email && (
                      <div className="text-xs text-muted-foreground mt-1">{donation.email}</div>
                    )}
                  </TableCell>
                  <TableCell>₽{donation.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(donation.date).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!donation.email}
                      onClick={() => donation.email && handleSendThankYou(donation.email)}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      {donation.email ? don.sendThankYou : don.recordInfo}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDonations.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {common.donations} не найдены
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Попробуйте изменить поисковый запрос."
                  : "Для этого мероприятия еще нет пожертвований."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
