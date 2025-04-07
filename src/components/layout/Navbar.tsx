
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-charity-primary" />
          <span className="text-xl font-heading font-bold">CharityConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-foreground hover:text-charity-primary transition">Home</Link>
          <Link to="/dashboard" className="text-foreground hover:text-charity-primary transition">Dashboard</Link>
          <Link to="/organizer" className="text-foreground hover:text-charity-primary transition">Organize</Link>
          <Button asChild variant="ghost">
            <Link to="/dashboard">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button asChild>
            <Link to="/organizer">Create Event</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden absolute w-full bg-white border-b transition-all duration-300 ease-in-out",
        isMenuOpen ? "max-h-64 py-4" : "max-h-0 py-0 overflow-hidden"
      )}>
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <Link to="/" className="text-foreground hover:text-charity-primary transition px-2 py-2">Home</Link>
          <Link to="/dashboard" className="text-foreground hover:text-charity-primary transition px-2 py-2">Dashboard</Link>
          <Link to="/organizer" className="text-foreground hover:text-charity-primary transition px-2 py-2">Organize</Link>
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/dashboard">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link to="/organizer">Create Event</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
