import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  User,
  Calendar,
  FileText,
  UserPlus,
  Stethoscope,
  CreditCard,
  BarChart3,
  Bed,
} from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Patients", href: "/patients", icon: User },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Doctors", href: "/doctors", icon: Stethoscope },
    { name: "IPD", href: "/ipd", icon: Bed },
    { name: "EMR", href: "/emr", icon: FileText },
    { name: "Billing", href: "/billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 ios-shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                HealthCare Pro
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="h-6 w-px bg-border/50" />
              <span className="text-sm text-muted-foreground">
                Welcome back, {profile?.full_name || user?.email?.split("@")[0]}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-card/50 backdrop-blur-sm border-r border-border/50 h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                        isActive ? "" : "group-hover:scale-110"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
