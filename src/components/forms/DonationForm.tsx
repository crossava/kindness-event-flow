
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { russianContent } from "@/lib/localization/russianContent";

interface DonationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventId: string;
  onDonate: (donationData: any) => void;
}

export const DonationForm = ({
  open,
  onOpenChange,
  eventTitle,
  eventId,
  onDonate,
}: DonationFormProps) => {
  const { donations: don, common } = russianContent;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    isAnonymous: false,
    cardNumber: "",
    expiryDate: "",
    cvc: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Пожалуйста, введите корректную сумму");
      return;
    }

    if (!formData.isAnonymous && (!formData.name || !formData.email)) {
      toast.error("Пожалуйста, заполните ваше имя и email");
      return;
    }

    if (!formData.cardNumber || !formData.expiryDate || !formData.cvc) {
      toast.error("Пожалуйста, заполните данные карты");
      return;
    }

    // Create donation data
    const donationData = {
      id: Date.now().toString(),
      eventId,
      event: eventTitle,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString(),
      ...(formData.isAnonymous
        ? { donor: "Анонимный" }
        : { name: formData.name, email: formData.email, donor: formData.name }),
    };

    // Call the callback
    onDonate(donationData);
    onOpenChange(false);
    toast.success("Спасибо за ваше пожертвование!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {common.donate} - {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium mb-2">Пожертвование для:</p>
            <p className="font-bold">{eventTitle}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{don.amount}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="Введите сумму"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="anonymous" 
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => handleChange("isAnonymous", checked)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Сделать пожертвование анонимно
            </Label>
          </div>

          {!formData.isAnonymous && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{common.name}</Label>
                <Input
                  id="name"
                  placeholder="Введите ваше имя"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{common.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Введите ваш email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </>
          )}

          <div className="pt-4">
            <h3 className="text-sm font-medium mb-4">Платежная информация</h3>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Номер карты</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleChange("cardNumber", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Срок действия</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleChange("expiryDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={formData.cvc}
                  onChange={(e) => handleChange("cvc", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {common.cancel}
          </Button>
          <Button onClick={handleSubmit}>
            {common.donate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
