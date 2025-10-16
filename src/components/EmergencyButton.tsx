import { useState } from "react";
import { Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const EmergencyButton = () => {
  const [showDialog, setShowDialog] = useState(false);

  const handleEmergencyClick = () => {
    setShowDialog(true);
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
    setShowDialog(false);
  };

  return (
    <>
      {/* Botão Flutuante de Emergência */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={handleEmergencyClick}
          size="lg"
          className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-elegant hover:shadow-glow text-white animate-pulse"
        >
          <Phone className="h-8 w-8" />
        </Button>
        <div className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
        </div>
      </motion.div>

      {/* Dialog de Emergência */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl shadow-elegant max-w-md w-full p-6 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Emergência</h3>
                    <p className="text-sm text-muted-foreground">Escolha um contato</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDialog(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleCall('192')}
                  variant="default"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  SAMU - 192
                </Button>
                
                <Button
                  onClick={() => handleCall('193')}
                  variant="default"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Bombeiros - 193
                </Button>

                <Button
                  onClick={() => handleCall('190')}
                  variant="outline"
                  size="lg"
                  className="w-full text-lg font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Polícia - 190
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Em caso de emergência médica grave, ligue imediatamente para o SAMU
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyButton;
