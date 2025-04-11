import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, PlusCircle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
  onCreateGroup?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onCreateGroup }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <span className="text-white">TripHarmonizer</span>
          </Link>
          <div className="flex items-center gap-4">
            {onCreateGroup && (
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={onCreateGroup}
              >
                <PlusCircle size={16} />
                <span>New Trip</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-primary-foreground text-primary rounded-full"
                >
                  <User size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm font-medium">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user?.name || user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6">{children}</main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>
            © {new Date().getFullYear()} TripHarmonizer - Split expenses with
            ease
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
