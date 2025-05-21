
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
import { RubleIcon } from "@/components/icons";

// Mock data for event details
const mockEvent = {
  id: "1",
  title: "День чистого пляжа",
  description: "Присоединяйтесь к нам на день уборки пляжа, чтобы защитить морских обитателей и создать более чистую окружающую среду для всех. Эта инициатива направлена на удаление пластика и других загрязняющих веществ с наших берегов, просвещение участников о сохранении морской среды и воспитание чувства ответственности сообщества за наши природные ресурсы. Все принадлежности будут предоставлены, включая перчатки, мешки для мусора и прохладительные напитки. Приглашаются семьи, дети должны быть в сопровождении взрослых.",
  date: "2025-05-15T10:00:00",
  endDate: "2025-05-15T15:00:00",
  location: "Сочи, Имеретинский пляж",
  address: "курортный район Имеретинский, федеральная территория Сириус",
  category: "Environment",
  organizer: "образовательный центр поддержки талантливых детей в России Сириус",
  volunteers: { needed: 50, joined: 32 },
  donations: { goal: 2000, raised: 1250 },
  image: "https://live.staticflickr.com/65535/48453652346_0a7c12f9ec_b.jpg",
};

const EventPage = () => {
  const { id } = useParams();
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("25");
  
  // In a real app, fetch event by ID from API
  const event = mockEvent;
  
  const donationProgress = (event.donations.raised / event.donations.goal) * 100;
  
  const formattedDate = new Date(event.date).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  const formattedTime = `${new Date(event.date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${new Date(event.endDate).toLocaleTimeString("ru-RU", {
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
    toast.success("Ссылка на событие скопирована!");
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
                  <p className="font-medium">Организовано: {event.organizer}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.volunteers.joined} из {event.volunteers.needed} волонтеров присоединились
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="charity-card flex flex-col space-y-5">
            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setIsVolunteerDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Я волонтер
              </Button>
              
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Поделиться
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Volunteer Dialog */}
      <Dialog open={isVolunteerDialogOpen} onOpenChange={setIsVolunteerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Волонтер для: {event.title}</DialogTitle>
            <DialogDescription>
              Введите свои данные, чтобы зарегистрироваться в качестве волонтера:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ваше имя</Label>
              <Input id="name" placeholder="Введите полное ФИО" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Укажите свой email" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input id="phone" placeholder="Введите номер телефона" />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleVolunteerSubmit}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Donate Dialog */}
      <Dialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Поддержать мероприятие</DialogTitle>
                <DialogDescription>
                    Отсканируйте QR-код для пожертвования. Спасибо за ваш вклад!
                </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center py-4">
                <img
                    src="https://i.pinimg.com/736x/f6/c3/c6/f6c3c650a0c583bfe48d43fdfb4ab8a3.jpg"
                    alt="QR код для пожертвования"
                    className="w-60 h-60 object-contain"
                />
            </div>

            <DialogFooter>
                <Button onClick={() => setIsDonateDialogOpen(false)}>
                    Закрыть
                </Button>
            </DialogFooter>
        </DialogContent>
       </Dialog>
    </div>
  );
};

export default EventPage;
