
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-charity-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-charity-primary" />
              <span className="text-lg font-heading font-bold">CharityConnect</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Объединяем волонтеров по всей стране.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-medium mb-4">Быстрый доступ</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-charity-primary">Главная</Link></li>
              <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-charity-primary">Дашборд</Link></li>
              {/*<li><Link to="/organizer" className="text-sm text-muted-foreground hover:text-charity-primary">Панель управления</Link></li>*/}
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-medium mb-4">Категории</h3>
            <ul className="space-y-2">
              <li><Link to="/?category=animals" className="text-sm text-muted-foreground hover:text-charity-primary">Животные</Link></li>
              <li><Link to="/?category=environment" className="text-sm text-muted-foreground hover:text-charity-primary">Окружающая среда</Link></li>
              <li><Link to="/?category=health" className="text-sm text-muted-foreground hover:text-charity-primary">Здоровье</Link></li>
              <li><Link to="/?category=education" className="text-sm text-muted-foreground hover:text-charity-primary">Образование</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-medium mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">support@charityconnect.com</li>
              <li className="text-sm text-muted-foreground">+7 (999) 99-99</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 CharityConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
