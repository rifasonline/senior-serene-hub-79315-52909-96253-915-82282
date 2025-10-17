import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Search, Clock, AlertCircle, CheckCircle2, Trash2, Pencil, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TaskStatus = "pending" | "in_progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Task {
  id: string;
  elderly_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  scheduled_time: string;
  notes: string | null;
  created_at: string;
}

interface ElderlyProfile {
  id: string;
  name: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [elderlyProfiles, setElderlyProfiles] = useState<ElderlyProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    elderly_id: "",
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    status: "pending" as TaskStatus,
    deadline: "",
    scheduled_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch elderly profiles
      const { data: profiles } = await supabase
        .from("elderly_profiles")
        .select("id, name")
        .eq("caregiver_id", user.id);

      if (profiles) setElderlyProfiles(profiles);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from("daily_tasks")
        .select("*")
        .in("elderly_id", profiles?.map(p => p.id) || [])
        .order("created_at", { ascending: false });

      if (tasksData) setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as tarefas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      if (!formData.elderly_id || !formData.title) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha pelo menos o perfil e o título da tarefa.",
          variant: "destructive",
        });
        return;
      }

      const taskData = {
        ...formData,
        task_type: "other" as const,
        completed: formData.status === "completed",
        scheduled_time: formData.scheduled_time || new Date().toISOString(),
      };

      if (editingTask) {
        const { error } = await supabase
          .from("daily_tasks")
          .update(taskData)
          .eq("id", editingTask.id);

        if (error) throw error;

        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("daily_tasks")
          .insert([taskData]);

        if (error) throw error;

        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Erro ao salvar tarefa",
        description: "Não foi possível salvar a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("daily_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;

    try {
      const { error } = await supabase
        .from("daily_tasks")
        .update({ 
          status: newStatus,
          completed: newStatus === "completed",
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", draggableId);

      if (error) throw error;

      fetchData();

      toast({
        title: "Status atualizado",
        description: "A tarefa foi movida com sucesso.",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível mover a tarefa.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      elderly_id: "",
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      deadline: "",
      scheduled_time: "",
      notes: "",
    });
    setEditingTask(null);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      elderly_id: task.elderly_id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? format(new Date(task.deadline), "yyyy-MM-dd") : "",
      scheduled_time: task.scheduled_time ? format(new Date(task.scheduled_time), "yyyy-MM-dd'T'HH:mm") : "",
      notes: task.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === "pending"),
    in_progress: filteredTasks.filter(t => t.status === "in_progress"),
    completed: filteredTasks.filter(t => t.status === "completed"),
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const overdueTasks = tasks.filter(t => {
    if (!t.deadline || t.status === "completed") return false;
    return new Date(t.deadline) < new Date();
  }).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "in_progress": return <AlertCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "pending": return "Pendente";
      case "in_progress": return "Em Progresso";
      case "completed": return "Concluída";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minhas Tarefas</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas atividades diárias</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="elderly_id">Perfil do Idoso *</Label>
                    <Select value={formData.elderly_id} onValueChange={(value) => setFormData({ ...formData, elderly_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {elderlyProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Administrar medicamento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva a tarefa..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={formData.priority} onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_progress">Em Progresso</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled_time">Data/Hora Agendada</Label>
                      <Input
                        id="scheduled_time"
                        type="datetime-local"
                        value={formData.scheduled_time}
                        onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="deadline">Prazo Limite</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas Adicionais</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Observações extras..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTask}>
                    {editingTask ? "Atualizar" : "Criar"} Tarefa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tasksByStatus.pending.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                tarefas aguardando início
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tasksByStatus.in_progress.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                tarefas em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Concluída</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tasksByStatus.completed.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                tarefas finalizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(["pending", "in_progress", "completed"] as TaskStatus[]).map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-card border rounded-lg p-4 min-h-[400px] transition-colors ${
                      snapshot.isDraggingOver ? "border-primary bg-accent/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      {getStatusIcon(status)}
                      <h3 className="font-semibold text-lg">{getStatusLabel(status)}</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {tasksByStatus[status].length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {tasksByStatus[status].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move transition-shadow ${
                                snapshot.isDragging ? "shadow-lg" : ""
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                                  <Badge className={getPriorityColor(task.priority)}>
                                    {getPriorityLabel(task.priority)}
                                  </Badge>
                                </div>

                                {task.description && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                {task.deadline && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <Calendar className="h-3 w-3" />
                                    Prazo: {format(new Date(task.deadline), "dd/MM/yyyy", { locale: ptBR })}
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDialog(task)}
                                    className="flex-1"
                                  >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} />
              <p className="text-xs text-muted-foreground mt-2">
                {completedTasks} de {totalTasks} tarefas concluídas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total de Tarefas</p>
                <p className="text-2xl font-bold mt-1">{totalTasks}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                <p className="text-2xl font-bold mt-1">{completedTasks}</p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-4">
                <p className="text-sm text-destructive">Tarefas Atrasadas</p>
                <p className="text-2xl font-bold text-destructive mt-1">{overdueTasks}</p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/app/history"}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Ver Histórico Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
