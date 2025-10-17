import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Plus, 
  History, 
  Bell,
  Crown,
  ListTodo,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  nextEvent: { title: string; date: string } | null;
  recentActivities: Array<{ id: string; type: string; description: string; timestamp: string }>;
  weeklyProgress: Array<{ day: string; completed: number }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    nextEvent: null,
    recentActivities: [],
    weeklyProgress: []
  });
  const [loading, setLoading] = useState(true);
  const subscription = useSubscription(user);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadDashboardStats(session.user.id);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const loadDashboardStats = async (userId: string) => {
    try {
      // Get elderly profiles for the user
      const { data: elderlyProfiles } = await supabase
        .from('elderly_profiles')
        .select('id')
        .eq('caregiver_id', userId);

      if (!elderlyProfiles || elderlyProfiles.length === 0) {
        return;
      }

      const elderlyIds = elderlyProfiles.map(p => p.id);

      // Get tasks stats
      const { data: tasks } = await supabase
        .from('daily_tasks')
        .select('completed, completed_at')
        .in('elderly_id', elderlyIds);

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.completed).length || 0;

      // Get next appointment
      const { data: nextAppointment } = await supabase
        .from('appointments')
        .select('title, appointment_date')
        .in('elderly_id', elderlyIds)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      // Get recent activities (last 3 completed tasks)
      const { data: recentTasks } = await supabase
        .from('daily_tasks')
        .select('id, task_type, completed_at')
        .in('elderly_id', elderlyIds)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(3);

      const recentActivities = recentTasks?.map(task => ({
        id: task.id,
        type: task.task_type,
        description: `${task.task_type} concluída`,
        timestamp: task.completed_at || ''
      })) || [];

      // Calculate weekly progress
      const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const today = new Date();
      const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        
        const dayTasks = tasks?.filter(t => {
          if (!t.completed_at) return false;
          const taskDate = new Date(t.completed_at);
          return taskDate.toDateString() === date.toDateString();
        }).length || 0;

        return {
          day: weekDays[date.getDay()],
          completed: dayTasks
        };
      });

      setStats({
        totalTasks,
        completedTasks,
        nextEvent: nextAppointment ? {
          title: nextAppointment.title,
          date: new Date(nextAppointment.appointment_date).toLocaleDateString('pt-BR')
        } : null,
        recentActivities,
        weeklyProgress
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header do Usuário */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(user?.user_metadata?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    Olá, {user?.user_metadata?.full_name || 'Usuário'}!
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    {subscription.plan === 'pro' ? (
                      <Badge variant="default" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Plano Pro
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Plano Básico</Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => navigate('/app/profile')} variant="outline">
                Ver Perfil
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completionRate}% concluídas
              </p>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximo Evento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.nextEvent ? (
                <>
                  <div className="text-lg font-semibold truncate">{stats.nextEvent.title}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {stats.nextEvent.date}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum evento agendado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Atividades Recentes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivities.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimas ações registradas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Progresso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progresso Semanal
              </CardTitle>
              <CardDescription>Tarefas concluídas nos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Atividades Recentes Detalhadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>Últimas 3 ações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade recente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/app/tasks')} 
                className="h-auto py-4 flex-col gap-2"
              >
                <Plus className="h-5 w-5" />
                Nova Tarefa
              </Button>
              <Button 
                onClick={() => navigate('/app/agenda')} 
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                <Calendar className="h-5 w-5" />
                Novo Evento
              </Button>
              <Button 
                onClick={() => navigate('/app/history')} 
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                <History className="h-5 w-5" />
                Ver Histórico
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Banner do Plano */}
        {subscription.plan !== 'pro' && (
          <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Upgrade para o Plano Pro
              </CardTitle>
              <CardDescription>
                Desbloqueie recursos exclusivos como botão SOS, histórico ilimitado, múltiplos perfis e relatórios detalhados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/#pricing')}>
                Ver Planos
              </Button>
            </CardContent>
          </Card>
        )}

        {subscription.features.hasSOSButton && (
          <Card className="mt-6 border-destructive/50 bg-gradient-to-r from-destructive/5 to-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                🚨 Botão SOS Ativo
              </CardTitle>
              <CardDescription>
                Recurso exclusivo do Plano Pro - Em breve disponível para emergências
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
