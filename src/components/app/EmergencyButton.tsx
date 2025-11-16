import { useState } from 'react';
import { Siren, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface EmergencyService {
  name: string;
  number: string;
  icon: string;
}

const EMERGENCY_SERVICES: EmergencyService[] = [
  { name: 'SAMU', number: '192', icon: '🚑' },
  { name: 'Bombeiros', number: '193', icon: '🚒' },
  { name: 'Polícia', number: '190', icon: '🚓' },
];

export const EmergencyButton = () => {
  const { user, subscription } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);

  const isMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const logEmergencyAlert = async (service: EmergencyService) => {
    if (!user) return;

    try {
      // Get the first elderly profile (or you could let user select)
      const { data: elderlyProfiles } = await supabase
        .from('elderly_profiles')
        .select('id')
        .eq('caregiver_id', user.id)
        .limit(1);

      if (elderlyProfiles && elderlyProfiles.length > 0) {
        await supabase.from('sos_alerts').insert({
          elderly_id: elderlyProfiles[0].id,
          triggered_by: user.id,
          notes: `Chamada de emergência: ${service.name} (${service.number})`,
          status: 'pending',
        });
      }
    } catch (error) {
      console.error('Error logging emergency alert:', error);
    }
  };

  const handleEmergencyClick = async (service: EmergencyService) => {
    setIsOpen(false);
    
    // Log the alert
    await logEmergencyAlert(service);

    if (isMobile()) {
      // Mobile: open phone dialer
      window.location.href = `tel:${service.number}`;
      toast({
        title: "Discador aberto",
        description: `Ligando para ${service.name} - ${service.number}`,
      });
    } else {
      // Desktop: show dialog
      setSelectedService(service);
      setShowCallDialog(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Número copiado",
      description: `${text} copiado para a área de transferência`,
    });
  };

  const isPro = subscription.plan === 'pro';
  const isDisabled = !isPro || subscription.loading;

  const buttonContent = (
    <Button
      disabled={isDisabled}
      className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 
                 disabled:bg-destructive/50 disabled:opacity-50 
                 shadow-elegant transition-smooth"
      aria-label="Botão de Emergência SOS"
    >
      <Siren className="h-8 w-8 text-destructive-foreground" />
    </Button>
  );

  if (!isPro && !subscription.loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-pulse">
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="font-semibold">Recurso exclusivo do Plano Pro</p>
            <p className="text-sm text-muted-foreground mt-1">
              Atualize seu plano para acessar o botão de emergência SOS
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            {buttonContent}
          </PopoverTrigger>
          
          <PopoverContent side="top" className="w-64 p-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-destructive mb-2 px-2">
                Emergência - Ligue agora
              </p>
              {EMERGENCY_SERVICES.map((service) => (
                <Button
                  key={service.number}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-3 hover:bg-destructive/10"
                  onClick={() => handleEmergencyClick(service)}
                >
                  <span className="text-2xl">{service.icon}</span>
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-semibold">{service.name}</span>
                    <span className="text-sm text-muted-foreground">{service.number}</span>
                  </div>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Desktop Call Dialog */}
      <AlertDialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="text-3xl">{selectedService?.icon}</span>
              Ligue para {selectedService?.name}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center py-4">
              <div className="text-4xl font-bold text-foreground mb-2">
                {selectedService?.number}
              </div>
              <p className="text-sm text-muted-foreground">
                Use seu telefone para discar o número acima
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedService) {
                  copyToClipboard(selectedService.number);
                }
              }}
              className="w-full sm:w-auto"
            >
              Copiar número
            </Button>
            <AlertDialogAction className="w-full sm:w-auto">
              Fechar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
