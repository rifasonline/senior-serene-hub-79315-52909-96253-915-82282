import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center space-y-4 p-8">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <Button asChild>
          <Link to="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
