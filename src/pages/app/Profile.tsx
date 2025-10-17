import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { User, Mail, Phone, Lock, Upload, Crown, Check, Users, Pencil, Trash2, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  cpf: string | null;
}

interface Subscription {
  plan_type: "basic" | "pro";
  status: string;
  expires_at: string | null;
}

interface ElderlyProfile {
  id: string;
  name: string;
  birth_date: string;
  photo_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_conditions: string[] | null;
  allergies: string[] | null;
}

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [elderlyProfiles, setElderlyProfiles] = useState<ElderlyProfile[]>([]);
  const [isElderlyDialogOpen, setIsElderlyDialogOpen] = useState(false);
  const [editingElderly, setEditingElderly] = useState<ElderlyProfile | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    keepSessionActive: true,
    showTutorials: true,
  });

  const [elderlyForm, setElderlyForm] = useState({
    name: "",
    birth_date: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);
      await fetchProfile(user.id);
      await fetchSubscription(user.id);
      await fetchElderlyProfiles(user.id);
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/auth");
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan_type, status, expires_at")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      setSubscription(data || { plan_type: "basic", status: "active", expires_at: null });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setSubscription({ plan_type: "basic", status: "active", expires_at: null });
    }
  };

  const fetchElderlyProfiles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("elderly_profiles")
        .select("*")
        .eq("caregiver_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setElderlyProfiles(data || []);
    } catch (error) {
      console.error("Error fetching elderly profiles:", error);
    }
  };

  const handleSaveElderly = async () => {
    try {
      if (!elderlyForm.name || !elderlyForm.birth_date) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha nome e data de nascimento.",
          variant: "destructive",
        });
        return;
      }

      const isPro = subscription?.plan_type === "pro";
      if (!isPro && elderlyProfiles.length >= 2 && !editingElderly) {
        toast({
          title: "Limite atingido",
          description: "Plano Básico permite até 2 perfis. Faça upgrade para Pro.",
          variant: "destructive",
        });
        return;
      }

      if (editingElderly) {
        const { error } = await supabase
          .from("elderly_profiles")
          .update({
            name: elderlyForm.name,
            birth_date: elderlyForm.birth_date,
            emergency_contact_name: elderlyForm.emergency_contact_name || null,
            emergency_contact_phone: elderlyForm.emergency_contact_phone || null,
          })
          .eq("id", editingElderly.id);

        if (error) throw error;

        toast({
          title: "Perfil atualizado",
          description: "As informações do idoso foram atualizadas.",
        });
      } else {
        const { error } = await supabase
          .from("elderly_profiles")
          .insert({
            caregiver_id: user.id,
            name: elderlyForm.name,
            birth_date: elderlyForm.birth_date,
            emergency_contact_name: elderlyForm.emergency_contact_name || null,
            emergency_contact_phone: elderlyForm.emergency_contact_phone || null,
          });

        if (error) throw error;

        toast({
          title: "Perfil criado",
          description: "Novo perfil de idoso adicionado com sucesso.",
        });
      }

      await fetchElderlyProfiles(user.id);
      setIsElderlyDialogOpen(false);
      setElderlyForm({ name: "", birth_date: "", emergency_contact_name: "", emergency_contact_phone: "" });
      setEditingElderly(null);
    } catch (error: any) {
      console.error("Error saving elderly profile:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o perfil.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteElderly = async (id: string) => {
    try {
      const { error } = await supabase
        .from("elderly_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Perfil removido",
        description: "O perfil do idoso foi removido com sucesso.",
      });

      await fetchElderlyProfiles(user.id);
    } catch (error: any) {
      console.error("Error deleting elderly profile:", error);
      toast({
        title: "Erro ao remover",
        description: error.message || "Não foi possível remover o perfil.",
        variant: "destructive",
      });
    }
  };

  const openElderlyDialog = (elderly?: ElderlyProfile) => {
    if (elderly) {
      setEditingElderly(elderly);
      setElderlyForm({
        name: elderly.name,
        birth_date: elderly.birth_date,
        emergency_contact_name: elderly.emergency_contact_name || "",
        emergency_contact_phone: elderly.emergency_contact_phone || "",
      });
    } else {
      setEditingElderly(null);
      setElderlyForm({ name: "", birth_date: "", emergency_contact_name: "", emergency_contact_phone: "" });
    }
    setIsElderlyDialogOpen(true);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      await fetchProfile(user.id);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "A nova senha e a confirmação devem ser iguais.",
          variant: "destructive",
        });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast({
          title: "Senha muito curta",
          description: "A senha deve ter no mínimo 6 caracteres.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });

      setIsPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validar tamanho do arquivo (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O avatar deve ter no máximo 2MB.",
          variant: "destructive",
        });
        return;
      }

      // Criar preview local imediatamente
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => prev ? { ...prev, avatar_url: reader.result as string } : null);
      };
      reader.readAsDataURL(file);

      // Fazer upload para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Avatar atualizado",
        description: "Sua foto foi salva com sucesso.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Não foi possível atualizar o avatar.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  const isPro = subscription?.plan_type === "pro";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {formData.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Meu Perfil
              </h1>
              <p className="text-muted-foreground mt-1">
                {user?.email}
              </p>
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
            <Check className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1: Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>Gerencie suas informações básicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10 bg-muted/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="avatar">Foto de Perfil</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {formData.full_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <Button type="button" variant="outline" className="gap-2" asChild>
                          <span>
                            <Upload className="h-4 w-4" />
                            Alterar Foto
                          </span>
                        </Button>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG ou GIF (máx. 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Lock className="h-4 w-4" />
                        Alterar Senha
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Alterar Senha</DialogTitle>
                        <DialogDescription>
                          Crie uma nova senha segura para sua conta
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nova Senha</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Mínimo 6 caracteres"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Digite novamente"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleChangePassword}>
                          Alterar Senha
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>Personalize sua experiência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Alternar entre tema claro e escuro
                    </p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber atualizações importantes
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, emailNotifications: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Manter Sessão Ativa</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanecer conectado automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={preferences.keepSessionActive}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, keepSessionActive: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar Dicas e Tutoriais</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir ajuda durante o uso
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showTutorials}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, showTutorials: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Subscription Plan */}
          <div className="lg:col-span-1">
            <Card className={isPro ? "border-primary shadow-soft" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {isPro && <Crown className="h-5 w-5 text-primary" />}
                    Plano Atual
                  </CardTitle>
                  <Badge variant={isPro ? "default" : "secondary"}>
                    {isPro ? "Pro" : "Básico"}
                  </Badge>
                </div>
                <CardDescription>
                  {isPro ? "Acesso total aos recursos" : "Recursos limitados"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPro ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Perfis ilimitados de idosos</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Histórico médico completo</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Alertas SOS em tempo real</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Suporte prioritário 24/7</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Relatórios e análises avançadas</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Gerenciar assinatura",
                            description: "Funcionalidade em desenvolvimento",
                          });
                        }}
                      >
                        Gerenciar Assinatura
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        {subscription?.expires_at 
                          ? `Renova em ${new Date(subscription.expires_at).toLocaleDateString("pt-BR")}`
                          : "Assinatura ativa"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Até 2 perfis de idosos</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Histórico médico (30 dias)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Recursos básicos de agenda</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Desbloqueie com Pro:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Perfis ilimitados</li>
                          <li>• Histórico completo</li>
                          <li>• Alertas SOS</li>
                          <li>• Suporte prioritário</li>
                        </ul>
                      </div>

                      <Button 
                        className="w-full gradient-primary"
                        onClick={() => navigate("/pricing")}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Fazer Upgrade para Pro
                      </Button>
                    </div>
                  </>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 4: Elderly Profiles */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Perfis de Idosos
                  </CardTitle>
                  <CardDescription>
                    Adicione informações sobre os idosos que você acompanha
                  </CardDescription>
                </div>
                <Button onClick={() => openElderlyDialog()} className="gap-2">
                  <Users className="h-4 w-4" />
                  Adicionar Idoso
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {elderlyProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum perfil de idoso cadastrado ainda
                  </p>
                  <Button onClick={() => openElderlyDialog()} variant="outline">
                    Adicionar Primeiro Perfil
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {elderlyProfiles.map((elderly) => (
                    <Card key={elderly.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={elderly.photo_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {elderly.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{elderly.name}</h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{calculateAge(elderly.birth_date)} anos</span>
                            </div>
                            {elderly.emergency_contact_name && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                Contato: {elderly.emergency_contact_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1"
                            onClick={() => openElderlyDialog(elderly)}
                          >
                            <Pencil className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover o perfil de ${elderly.name}?`)) {
                                handleDeleteElderly(elderly.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isPro && elderlyProfiles.length > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 Você está usando {elderlyProfiles.length} de 2 perfis disponíveis no plano Básico.
                    {elderlyProfiles.length >= 2 && " Faça upgrade para Pro e tenha perfis ilimitados!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Elderly Dialog */}
        <Dialog open={isElderlyDialogOpen} onOpenChange={setIsElderlyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingElderly ? "Editar Perfil do Idoso" : "Adicionar Perfil do Idoso"}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações básicas sobre o idoso
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="elderly_name">Nome Completo *</Label>
                <Input
                  id="elderly_name"
                  value={elderlyForm.name}
                  onChange={(e) => setElderlyForm({ ...elderlyForm, name: e.target.value })}
                  placeholder="Nome do idoso"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderly_birth_date">Data de Nascimento *</Label>
                <Input
                  id="elderly_birth_date"
                  type="date"
                  value={elderlyForm.birth_date}
                  onChange={(e) => setElderlyForm({ ...elderlyForm, birth_date: e.target.value })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contato de Emergência</Label>
                <Input
                  id="emergency_contact_name"
                  value={elderlyForm.emergency_contact_name}
                  onChange={(e) => setElderlyForm({ ...elderlyForm, emergency_contact_name: e.target.value })}
                  placeholder="Nome do contato"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Telefone de Emergência</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={elderlyForm.emergency_contact_phone}
                  onChange={(e) => setElderlyForm({ ...elderlyForm, emergency_contact_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsElderlyDialogOpen(false);
                  setElderlyForm({ name: "", birth_date: "", emergency_contact_name: "", emergency_contact_phone: "" });
                  setEditingElderly(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveElderly}>
                {editingElderly ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
