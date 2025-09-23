import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Home, 
  Map, 
  BarChart3, 
  Database, 
  Upload, 
  Info, 
  Mail, 
  Moon, 
  Sun,
  LogIn,
  LogOut,
  User,
  FileText,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, isOfficial, isCitizen, isSuperAdmin } = useAuth();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const getNavItems = () => {
    const baseItems = [
      { name: "Home", path: "/", icon: Home },
    ];

    if (user) {
      if (profile?.role === 'super_admin') {
        baseItems.push(
          { name: "Admin Dashboard", path: "/admin", icon: Shield }
        );
      } else if (isOfficial) {
        baseItems.push(
          { name: "Atlas", path: "/atlas", icon: Map },
          { name: "DSS", path: "/dss", icon: BarChart3 },
          { name: "Dashboard", path: "/dashboard", icon: Database },
          { name: "Digitization", path: "/digitization", icon: Upload }
        );
      } else if (isCitizen) {
        baseItems.push(
          { name: "Apply for Claim", path: "/apply-claim", icon: FileText },
          { name: "My Claims", path: "/my-claims", icon: Database }
        );
      }
    }

    baseItems.push(
      { name: "About", path: "/about", icon: Info },
      { name: "Contact", path: "/contact", icon: Mail }
    );

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary-dark shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-white font-bold text-xl hidden sm:block">
                  FRA Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-white/20 text-white backdrop-blur-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-white hover:bg-white/20"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-white/90 text-sm hidden md:block">
                  {profile?.full_name} ({profile?.role})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-white hover:bg-white/20"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  title="Sign In"
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/20"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-sm rounded-lg m-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                <div className="flex justify-between items-center pt-4 border-t border-white/20">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="text-white hover:bg-white/20"
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>

                  {user ? (
                    <div className="flex flex-col gap-2 pt-4 border-t border-white/20">
                      <div className="text-white/90 text-sm px-3">
                        Signed in as: {profile?.full_name}
                      </div>
                      <div className="text-white/70 text-xs px-3">
                        Role: {profile?.role}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="text-white hover:bg-white/20 justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-white/20">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="text-white hover:bg-white/20 justify-start w-full"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;