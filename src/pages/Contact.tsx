import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem Enviada!",
      description: "Entraremos em contato em breve.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "contato@cuidabem.com.br",
      color: "primary",
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="text-foreground">Entre em Contato</h1>
          <p className="text-lg text-muted-foreground">
            Tem alguma dúvida ou sugestão? Estamos aqui para ajudar. 
            Entre em contato conosco através do formulário abaixo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Envie uma Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Nome
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-foreground">
                    Assunto
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Como podemos ajudar?"
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Mensagem
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escreva sua mensagem aqui..."
                    rows={6}
                    required
                    className="bg-background resize-none"
                  />
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Informações de Contato
              </h2>
              <p className="text-muted-foreground">
                Escolha a melhor forma de entrar em contato conosco. 
                Nossa equipe está pronta para atendê-lo.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className="border-border bg-card shadow-card hover:shadow-soft transition-smooth"
                >
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className={`p-3 rounded-lg gradient-${info.color}`}>
                      <info.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{info.title}</h3>
                      <p className="text-muted-foreground">{info.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border bg-muted/50">
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold text-foreground">Horário de Atendimento</h3>
                <p className="text-sm text-muted-foreground">
                  Segunda a Sexta: 8h às 18h
                </p>
                <p className="text-sm text-muted-foreground">
                  Sábado: 9h às 13h
                </p>
                <p className="text-sm text-muted-foreground">
                  Domingo: Fechado
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
