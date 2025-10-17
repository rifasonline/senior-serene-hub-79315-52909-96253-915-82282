import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Clock, 
  MapPin, 
  User, 
  Filter,
  List,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  History as HistoryIcon
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  appointment_date: string;
  location: string | null;
  doctor_name: string | null;
  completed: boolean;
  elderly_id: string;
}

type ViewMode = 'calendar' | 'list';
type FilterMode = 'all' | 'today' | 'week' | 'month';

export default function Agenda() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [elderlyProfiles, setElderlyProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appointment_date: '',
    location: '',
    doctor_name: '',
    elderly_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load elderly profiles
      const { data: profiles } = await supabase
        .from('elderly_profiles')
        .select('*')
        .eq('caregiver_id', user.id);

      setElderlyProfiles(profiles || []);

      if (profiles && profiles.length > 0) {
        const elderlyIds = profiles.map(p => p.id);

        // Load appointments
        const { data: appts } = await supabase
          .from('appointments')
          .select('*')
          .in('elderly_id', elderlyIds)
          .order('appointment_date', { ascending: true });

        setAppointments(appts || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.appointment_date || !formData.elderly_id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingAppointment) {
        // Update
        const { error } = await supabase
          .from('appointments')
          .update({
            title: formData.title,
            description: formData.description,
            appointment_date: formData.appointment_date,
            location: formData.location,
            doctor_name: formData.doctor_name
          })
          .eq('id', editingAppointment.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Evento atualizado com sucesso!'
        });
      } else {
        // Create
        const { error } = await supabase
          .from('appointments')
          .insert([{
            ...formData,
            completed: false
          }]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Evento criado com sucesso!'
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o evento.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Evento excluído com sucesso!'
      });

      loadData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o evento.',
        variant: 'destructive'
      });
    }
  };

  const handleToggleComplete = async (appointment: Appointment) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ completed: !appointment.completed })
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: appointment.completed ? 'Evento marcado como pendente' : 'Evento concluído!'
      });

      loadData();
    } catch (error) {
      console.error('Error toggling appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o evento.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      appointment_date: '',
      location: '',
      doctor_name: '',
      elderly_id: elderlyProfiles[0]?.id || ''
    });
    setEditingAppointment(null);
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      appointment_date: format(new Date(appointment.appointment_date), "yyyy-MM-dd'T'HH:mm"),
      location: appointment.location || '',
      doctor_name: appointment.doctor_name || '',
      elderly_id: appointment.elderly_id
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      elderly_id: elderlyProfiles[0]?.id || ''
    }));
    setIsDialogOpen(true);
  };

  // Filter appointments
  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    const now = new Date();
    switch (filterMode) {
      case 'today':
        filtered = filtered.filter(apt => 
          isSameDay(new Date(apt.appointment_date), now)
        );
        break;
      case 'week':
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 7);
        filtered = filtered.filter(apt => {
          const date = new Date(apt.appointment_date);
          return date >= now && date <= weekEnd;
        });
        break;
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        filtered = filtered.filter(apt => {
          const date = new Date(apt.appointment_date);
          return date >= monthStart && date <= monthEnd;
        });
        break;
    }

    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();

  // Get appointments for selected date
  const appointmentsForSelectedDate = appointments.filter(apt =>
    isSameDay(new Date(apt.appointment_date), selectedDate)
  );

  // Get dates with appointments
  const datesWithAppointments = appointments.map(apt => new Date(apt.appointment_date));

  // Stats
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.completed).length;
  const upcomingAppointments = appointments.filter(apt => 
    isFuture(new Date(apt.appointment_date)) && !apt.completed
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando agenda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Minha Agenda</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie compromissos e eventos
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAppointment ? 'Editar Evento' : 'Novo Evento'}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do compromisso
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Consulta médica"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="elderly_id">Idoso *</Label>
                    <select
                      id="elderly_id"
                      value={formData.elderly_id}
                      onChange={(e) => setFormData({ ...formData, elderly_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    >
                      <option value="">Selecione</option>
                      {elderlyProfiles.map(profile => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointment_date">Data e Hora *</Label>
                    <Input
                      id="appointment_date"
                      type="datetime-local"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor_name">Médico/Profissional</Label>
                      <Input
                        id="doctor_name"
                        value={formData.doctor_name}
                        onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                        placeholder="Nome do médico"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Clínica, hospital..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingAppointment ? 'Atualizar' : 'Criar'} Evento
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  onClick={() => setViewMode('calendar')}
                  className="gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendário
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Lista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant={filterMode === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterMode('all')}
                >
                  Todos os Eventos
                </Button>
                <Button
                  variant={filterMode === 'today' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterMode('today')}
                >
                  Hoje
                </Button>
                <Button
                  variant={filterMode === 'week' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterMode('week')}
                >
                  Esta Semana
                </Button>
                <Button
                  variant={filterMode === 'month' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterMode('month')}
                >
                  Este Mês
                </Button>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{totalAppointments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concluídos</span>
                  <span className="font-semibold text-green-600">{completedAppointments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Próximos</span>
                  <span className="font-semibold text-primary">{upcomingAppointments}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {viewMode === 'calendar' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Calendário</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      locale={ptBR}
                      className="rounded-md border"
                      modifiers={{
                        hasEvent: datesWithAppointments
                      }}
                      modifiersStyles={{
                        hasEvent: {
                          fontWeight: 'bold',
                          backgroundColor: 'hsl(var(--primary) / 0.1)'
                        }
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Events for selected date */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription>
                      {appointmentsForSelectedDate.length} evento(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {appointmentsForSelectedDate.length > 0 ? (
                        appointmentsForSelectedDate.map((apt) => (
                          <div
                            key={apt.id}
                            className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{apt.title}</h4>
                                  {apt.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : isFuture(new Date(apt.appointment_date)) ? (
                                    <Clock className="h-4 w-4 text-primary" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {format(new Date(apt.appointment_date), 'HH:mm')}
                                </p>
                                {apt.doctor_name && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <User className="h-3 w-3" />
                                    {apt.doctor_name}
                                  </p>
                                )}
                                {apt.location && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {apt.location}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(apt)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(apt.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhum evento nesta data
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Eventos</CardTitle>
                  <CardDescription>
                    {filteredAppointments.length} evento(s) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{apt.title}</h3>
                                {apt.completed ? (
                                  <Badge variant="default" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Concluído
                                  </Badge>
                                ) : isFuture(new Date(apt.appointment_date)) ? (
                                  <Badge variant="secondary" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    Próximo
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Passado</Badge>
                                )}
                              </div>

                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4" />
                                  {format(new Date(apt.appointment_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                                {apt.doctor_name && (
                                  <p className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {apt.doctor_name}
                                  </p>
                                )}
                                {apt.location && (
                                  <p className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {apt.location}
                                  </p>
                                )}
                                {apt.description && (
                                  <p className="mt-2">{apt.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleComplete(apt)}
                              >
                                {apt.completed ? 'Marcar Pendente' : 'Concluir'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(apt)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(apt.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-12">
                        Nenhum evento encontrado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Summary */}
        <Card className="mt-8">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{totalAppointments}</p>
                  <p className="text-sm text-muted-foreground">Total de Eventos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{completedAppointments}</p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{upcomingAppointments}</p>
                  <p className="text-sm text-muted-foreground">Próximos</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/app/history')} className="gap-2">
                <HistoryIcon className="h-4 w-4" />
                Ver Histórico Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
