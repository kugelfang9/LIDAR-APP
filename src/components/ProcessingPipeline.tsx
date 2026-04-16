import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Play, 
  Settings2, 
  Database, 
  Filter, 
  Layers, 
  Map as MapIcon,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type StepStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: StepStatus;
  progress: number;
}

interface ProcessingPipelineProps {
  onComplete: () => void;
  onStepChange: (stepId: string) => void;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ onComplete, onStepChange }) => {
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 'ingest', name: 'Data Ingestion', description: 'Loading LAS/LAZ point cloud data', icon: <Database className="w-4 h-4" />, status: 'pending', progress: 0 },
    { id: 'filter', name: 'Noise Filtering', description: 'Removing outlier points and atmospheric noise', icon: <Filter className="w-4 h-4" />, status: 'pending', progress: 0 },
    { id: 'classify', name: 'Ground Classification', description: 'Identifying terrain vs non-terrain points', icon: <Layers className="w-4 h-4" />, status: 'pending', progress: 0 },
    { id: 'dem', name: 'DEM Generation', description: 'Creating Digital Elevation Model', icon: <MapIcon className="w-4 h-4" />, status: 'pending', progress: 0 },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const startPipeline = () => {
    setIsProcessing(true);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    if (currentStepIndex === -1 || currentStepIndex >= steps.length || !isProcessing) return;

    const currentStep = steps[currentStepIndex];
    onStepChange(currentStep.id);

    setSteps(prev => prev.map((s, i) => i === currentStepIndex ? { ...s, status: 'processing' } : s));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setSteps(prev => prev.map((s, i) => i === currentStepIndex ? { ...s, status: 'completed', progress: 100 } : s));
        
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsProcessing(false);
          onComplete();
        }
      } else {
        setSteps(prev => prev.map((s, i) => i === currentStepIndex ? { ...s, progress } : s));
      }
    }, 400);

    return () => clearInterval(interval);
  }, [currentStepIndex, isProcessing]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium font-sans tracking-tight">Processing Pipeline</h3>
          <p className="text-sm text-muted-foreground">Monitor real-time data transformation</p>
        </div>
        <Button 
          onClick={startPipeline} 
          disabled={isProcessing}
          className="bg-primary text-background hover:bg-primary/90 font-bold uppercase tracking-wider text-xs px-6"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          {isProcessing ? 'Processing' : 'Execute Pipeline'}
        </Button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border transition-all duration-300 ${
              step.status === 'processing' 
                ? 'border-primary bg-secondary step-glow' 
                : step.status === 'completed'
                ? 'border-border bg-card opacity-70'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-primary">0{index + 1}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{step.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00ff95]" />
                ) : step.status === 'processing' ? (
                  <span className="text-[10px] font-mono text-primary animate-pulse">ACTIVE</span>
                ) : null}
              </div>
            </div>
            
            <div className="mt-3">
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${step.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">
                {step.status === 'processing' ? `${Math.round(step.progress)}% - ${step.description}` : step.status === 'completed' ? 'Completed' : 'Pending...'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-zinc-900/30 border border-dashed border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <Settings2 className="w-3 h-3" />
          <span>PIPELINE_LOGS: READY</span>
        </div>
        <div className="mt-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {steps.filter(s => s.status !== 'pending').map((s) => (
              <motion.div 
                key={`${s.id}-log`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-mono flex items-center gap-2"
              >
                <span className="text-zinc-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className={s.status === 'completed' ? 'text-green-500' : 'text-zinc-400'}>
                  {s.status === 'completed' ? `SUCCESS: ${s.id} completed` : `RUNNING: ${s.id}...`}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
