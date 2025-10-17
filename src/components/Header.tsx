import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import logo from "@/assets/logo-main.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { name: "Início", path: "/" },
    { name: "Funcionalidades", path: "/features" },
    { name: "Planos", path: "/#pricing", isHash: true },
    { name: "Sobre", path: "/about" },
    { name: "Contato", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.isHash) {
      if (location.pathname === "/") {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const pricingSection = document.getElementById('pricing');
          if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-lg shadow-card">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center transition-smooth hover:opacity-80 hover-lift">
            <img src={logo} alt="CuidaBem" className="h-20 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => (
              item.isHash ? (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item)}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-smooth text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Olá, {user.email}
                </span>
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => navigate("/app/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/auth")}
              >
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Login Button & Menu */}
          <div className="md:hidden flex items-center gap-2">
            {!user && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-xs px-3"
              >
                Entrar
              </Button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                item.isHash ? (
                  <button
                    key={item.path}
                    onClick={() => {
                      handleNavClick(item);
                      setIsOpen(false);
                    }}
                    className="px-4 py-3 rounded-md text-sm font-medium transition-smooth text-muted-foreground hover:bg-muted hover:text-foreground text-left"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-md text-sm font-medium transition-smooth ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              <div className="pt-2 space-y-2">
                {user && (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="w-full"
                      onClick={() => {
                        navigate("/app/dashboard");
                        setIsOpen(false);
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
