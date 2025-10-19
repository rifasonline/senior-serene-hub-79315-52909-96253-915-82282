import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Calendar, FileText, Search, Download, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoryItem {
  id: string;
  type: "task" | "appointment" | "medical";
  title: string;
  description: string;
  date: string;
  origin: string;
  elderlyName?: string;
  status?: string;
  details?: any;
}

export default function History() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<HistoryItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<HistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    tasks: 0,
    appointments: 0,
    medical: 0,
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, filterType]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch elderly profiles for this caregiver
      const { data: elderlyProfiles } = await supabase
        .from("elderly_profiles")
        .select("id, name")
        .eq("caregiver_id", user.id);

      const elderlyIds = elderlyProfiles?.map(e => e.id) || [];
      const elderlyMap = new Map(elderlyProfiles?.map(e => [e.id, e.name]) || []);

      // Fetch completed tasks
      const { data: tasks } = await supabase
        .from("daily_tasks")
        .select("*")
        .in("elderly_id", elderlyIds)
        .eq("completed", true)
        .order("completed_at", { ascending: false });

      // Fetch completed appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("*")
        .in("elderly_id", elderlyIds)
        .eq("completed", true)
        .order("appointment_date", { ascending: false });

      // Fetch medical history
      const { data: medicalHistory } = await supabase
        .from("medical_history")
        .select("*")
        .in("elderly_id", elderlyIds)
        .order("date", { ascending: false });

      const allActivities: HistoryItem[] = [
        ...(tasks?.map(task => ({
          id: task.id,
          type: "task" as const,
          title: task.title || task.description,
          description: task.notes || task.description,
          date: task.completed_at || task.scheduled_time,
          origin: "/app/tasks",
          elderlyName: elderlyMap.get(task.elderly_id),
          status: "Concluída",
          details: task,
        })) || []),
        ...(appointments?.map(apt => ({
          id: apt.id,
          type: "appointment" as const,
          title: apt.title,
          description: apt.description || "",
          date: apt.appointment_date,
          origin: "/app/agenda",
          elderlyName: elderlyMap.get(apt.elderly_id),
          status: "Finalizado",
          details: apt,
        })) || []),
        ...(medicalHistory?.map(med => ({
          id: med.id,
          type: "medical" as const,
          title: med.title,
          description: med.description,
          date: med.date,
          origin: "/app/history",
          elderlyName: elderlyMap.get(med.elderly_id),
          status: med.entry_type,
          details: med,
        })) || []),
      ];

      // Sort by date (most recent first)
      allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(allActivities);
      setStats({
        total: allActivities.length,
        tasks: tasks?.length || 0,
        appointments: appointments?.length || 0,
        medical: medicalHistory?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de atividades.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.elderlyName?.toLowerCase().includes(query)
      );
    }

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "medical":
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-green-100 text-green-800 border-green-200";
      case "appointment":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "medical":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Prepare CSV headers
      const headers = [
        "Data",
        "Tipo",
        "Título",
        "Descrição",
        "Para",
        "Status"
      ];

      // Prepare CSV rows
      const rows = filteredActivities.map(activity => [
        format(new Date(activity.date), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        activity.type === "task" ? "Tarefa" : activity.type === "appointment" ? "Evento" : "Médico",
        activity.title,
        activity.description.replace(/,/g, ";"), // Replace commas to avoid CSV issues
        activity.elderlyName || "N/A",
        activity.status || "N/A"
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // Add BOM for proper Excel encoding
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

      // Create download link
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `historico-cuidabem-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      toast({
        title: "Histórico exportado com sucesso",
        description: `${filteredActivities.length} registro(s) exportado(s) em CSV.`,
      });
    } catch (error) {
      console.error("Error exporting history:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o histórico. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Histórico de Atividades
          </h1>
          <p className="text-gray-600">Timeline completa de todas as suas atividades</p>
        </header>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="task">Tarefas</SelectItem>
              <SelectItem value="appointment">Eventos</SelectItem>
              <SelectItem value="medical">Médico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription>Total de Atividades</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardDescription>Tarefas Concluídas</CardDescription>
              <CardTitle className="text-3xl">{stats.tasks}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardDescription>Eventos Finalizados</CardDescription>
              <CardTitle className="text-3xl">{stats.appointments}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardDescription>Registros Médicos</CardDescription>
              <CardTitle className="text-3xl">{stats.medical}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Linha do Tempo</CardTitle>
            <CardDescription>
              {filteredActivities.length} registro(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Carregando histórico...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade encontrada</p>
              </div>
            ) : (
              <div className="relative space-y-4">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent" />

                {filteredActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="relative pl-16 pb-6 cursor-pointer hover:bg-gray-50 -ml-4 p-4 rounded-lg transition-colors"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-sm" />

                    {/* Icon */}
                    <div className="absolute left-12 top-4">
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {activity.description}
                          </p>
                          {activity.elderlyName && (
                            <p className="text-xs text-gray-500 mt-1">
                              Para: {activity.elderlyName}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge variant="outline" className={getActivityColor(activity.type)}>
                            {activity.type === "task" && "Tarefa"}
                            {activity.type === "appointment" && "Evento"}
                            {activity.type === "medical" && "Médico"}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {format(new Date(activity.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{filteredActivities.length}</span> registro(s) carregado(s)
          </div>
          <Button 
            onClick={handleExport} 
            variant="outline" 
            className="gap-2"
            disabled={isExporting || filteredActivities.length === 0}
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Histórico
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedActivity && getActivityIcon(selectedActivity.type)}
              {selectedActivity?.title}
            </DialogTitle>
            <DialogDescription>
              Detalhes da atividade
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <Badge className={`mt-1 ${getActivityColor(selectedActivity.type)}`}>
                  {selectedActivity.type === "task" && "Tarefa"}
                  {selectedActivity.type === "appointment" && "Evento"}
                  {selectedActivity.type === "medical" && "Registro Médico"}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="mt-1 text-gray-600">{selectedActivity.description || "Sem descrição"}</p>
              </div>

              {selectedActivity.elderlyName && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Para</label>
                  <p className="mt-1 text-gray-600">{selectedActivity.elderlyName}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Data e Hora</label>
                <p className="mt-1 text-gray-600">
                  {format(new Date(selectedActivity.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              {selectedActivity.status && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-gray-600">{selectedActivity.status}</p>
                </div>
              )}

              {selectedActivity.type === "appointment" && selectedActivity.details && (
                <>
                  {selectedActivity.details.doctor_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Médico</label>
                      <p className="mt-1 text-gray-600">{selectedActivity.details.doctor_name}</p>
                    </div>
                  )}
                  {selectedActivity.details.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Local</label>
                      <p className="mt-1 text-gray-600">{selectedActivity.details.location}</p>
                    </div>
                  )}
                </>
              )}

              {selectedActivity.type === "medical" && selectedActivity.details && (
                <>
                  {selectedActivity.details.doctor_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Médico</label>
                      <p className="mt-1 text-gray-600">{selectedActivity.details.doctor_name}</p>
                    </div>
                  )}
                  {selectedActivity.details.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Local</label>
                      <p className="mt-1 text-gray-600">{selectedActivity.details.location}</p>
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = selectedActivity.origin;
                  }}
                  className="w-full"
                >
                  Ir para {selectedActivity.origin}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
