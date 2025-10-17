import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { validateCPF, formatCPF, formatPhone } from "@/lib/cpf-validator";
import logoMain from "@/assets/logo-main.png";

const authSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  phone: z.string().min(10, "Telefone inválido").optional(),
  cpf: z.string().refine((cpf) => validateCPF(cpf), {
    message: "CPF inválido",
  }).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
      navigate("/app/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        navigate("/app/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      authSchema.parse({ email, password, fullName, phone, cpf });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erro de validação",
          description: error.errors[0].message,
        });
        return;
      }
    }

    setLoading(true);

    const cleanCpf = cpf.replace(/\D/g, '');
    const cleanPhone = phone.replace(/\D/g, '');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          phone: cleanPhone,
          cpf: cleanCpf,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login.",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erro de validação",
          description: error.errors[0].message,
        });
        return;
      }
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-scale-in">
          <img 
            src={logoMain} 
            alt="CuidaBem Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Card with glassmorphism effect */}
        <Card className="w-full backdrop-blur-xl bg-card/80 border-border/50 shadow-elegant">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center font-semibold">
              Bem-vindo ao CuidaBem
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Cuidado e atenção para quem você ama
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="transition-smooth">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="transition-smooth">
                  Criar Conta
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-smooth"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full transition-smooth hover-lift" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">
                      Nome Completo *
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-cpf" className="text-sm font-medium">
                      CPF *
                    </Label>
                    <Input
                      id="signup-cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      maxLength={14}
                      required
                      className="transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-sm font-medium">
                      Telefone *
                    </Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      maxLength={15}
                      required
                      className="transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      Email *
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Digite seu melhor email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      Senha *
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-smooth"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full transition-smooth hover-lift" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
