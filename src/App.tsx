import { useState, useEffect } from 'react';
import { 
  Activity, 
  Box, 
  Cpu, 
  Download, 
  Info, 
  Layers, 
  Maximize2, 
  Settings, 
  Zap,
  Terminal,
  Share2,
  FileCode
} from 'lucide-react';
import { LidarViewer } from './components/LidarViewer';
import { ProcessingPipeline } from './components/ProcessingPipeline';
import { generateMockLidarData, LidarPoint } from './lib/lidar-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { motion } from 'motion/react';

export default function App() {
  const [points, setPoints] = useState<LidarPoint[]>([]);
  const [colorMode, setColorMode] = useState<'intensity' | 'classification' | 'height'>('height');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<string>('idle');

  useEffect(() => {
    // Initial data load
    setPoints(generateMockLidarData(15000));
  }, []);

  const handlePipelineComplete = () => {
    setIsProcessing(false);
    setActiveStep('complete');
    // Simulate data update after processing
    setPoints(generateMockLidarData(25000));
    setColorMode('classification');
  };

  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId);
    if (stepId === 'classify') {
      setColorMode('classification');
    } else if (stepId === 'dem') {
      setColorMode('height');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e0e6ed] font-sans selection:bg-primary selection:text-background overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-[60px] border-b border-[#2d333d] flex items-center justify-between px-6 bg-[#14161b] z-50">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 20L12 4L22 20H2Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-[2px] uppercase text-primary">Nebula LiDAR</h1>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#707a8c]">SCAN_A92_NORTH_VALLEY.las • 1.4 GB</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1c1f26] rounded-full border border-[#2d333d]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff95] shadow-[0_0_8px_#00ff95]" />
            <span className="text-[10px] font-mono text-[#707a8c]">SYSTEM_READY</span>
          </div>
          <Separator orientation="vertical" className="h-6 bg-[#2d333d]" />
          <div className="text-[11px] text-[#707a8c]">Admin Mode</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-[280px_1fr_240px] overflow-hidden bg-[#2d333d] gap-[1px]">
        {/* Left Sidebar - Pipeline Control */}
        <aside className="bg-[#14161b] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="text-[11px] uppercase tracking-[1px] text-[#707a8c] mb-6 font-bold">Processing Pipeline</div>
            <ProcessingPipeline 
              onComplete={handlePipelineComplete} 
              onStepChange={handleStepChange}
            />
            
            <Separator className="my-8 bg-[#2d333d]" />
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[11px] font-bold text-[#707a8c] uppercase tracking-[1px] mb-4">Visualization Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#707a8c]">Point Density</label>
                    <span className="text-[10px] font-mono text-[#e0e6ed]">85%</span>
                  </div>
                  <Slider defaultValue={[85]} max={100} step={1} className="py-2" />
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <label className="text-xs text-[#e0e6ed]">Auto-Rotate</label>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <label className="text-xs text-[#e0e6ed]">Grid Overlay</label>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t border-[#2d333d]">
            <Button variant="outline" className="w-full bg-[#1c1f26] border-[#2d333d] text-[#e0e6ed] text-xs uppercase tracking-widest hover:bg-[#2d333d]">
              Pause Pipeline
            </Button>
          </div>
        </aside>

        {/* Center - 3D Viewer */}
        <section className="relative flex flex-col bg-[#0a0b0e]">
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#14161b]/80 border border-[#2d333d] p-3 rounded-lg backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1c1f26] rounded">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] text-[#707a8c] uppercase font-bold tracking-tighter">Current Status</div>
                  <div className="text-sm font-mono uppercase tracking-tight">
                    {activeStep === 'idle' ? 'System Ready' : 
                     activeStep === 'complete' ? 'Processing Complete' : 
                     `Executing: ${activeStep}`}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-2">
              <Tabs value={colorMode} onValueChange={(v: any) => setColorMode(v)} className="w-auto">
                <TabsList className="bg-[#14161b]/80 border border-[#2d333d] h-9 p-1">
                  <TabsTrigger value="height" className="text-[10px] h-7 px-3 data-[state=active]:bg-[#1c1f26]">HEIGHT</TabsTrigger>
                  <TabsTrigger value="intensity" className="text-[10px] h-7 px-3 data-[state=active]:bg-[#1c1f26]">INTENSITY</TabsTrigger>
                  <TabsTrigger value="classification" className="text-[10px] h-7 px-3 data-[state=active]:bg-[#1c1f26]">CLASS</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
            <Button variant="outline" size="icon" className="bg-[#14161b]/80 border-[#2d333d] hover:bg-[#1c1f26]">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-[#14161b]/80 border-[#2d333d] hover:bg-[#1c1f26]">
              <Box className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 bg-black tech-grid relative">
            <LidarViewer points={points} colorMode={colorMode} />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
              <Button variant="outline" className="bg-[#1c1f26] border-[#2d333d] text-[#e0e6ed] text-[12px] uppercase tracking-widest px-5">Orbit</Button>
              <Button variant="outline" className="bg-[#1c1f26] border-[#2d333d] text-[#e0e6ed] text-[12px] uppercase tracking-widest px-5">Pan</Button>
              <Button variant="outline" className="bg-[#1c1f26] border-[#2d333d] text-[#e0e6ed] text-[12px] uppercase tracking-widest px-5">Zoom</Button>
            </div>
          </div>
        </section>

        {/* Right Sidebar - Metadata & Info */}
        <aside className="bg-[#14161b] flex flex-col overflow-hidden">
          <div className="p-6">
            <div className="text-[11px] uppercase tracking-[1px] text-[#707a8c] mb-6 font-bold">Live Data Metrics</div>
            
            <div className="space-y-6">
              <div className="stat-card">
                <div className="text-[11px] text-[#707a8c] mb-1">Total Point Count</div>
                <div className="text-xl font-mono text-[#e0e6ed]">{points.length.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="text-[11px] text-[#707a8c] mb-1">Avg Density</div>
                <div className="text-xl font-mono text-[#e0e6ed]">42 pts/m²</div>
              </div>

              <div className="stat-card">
                <div className="text-[11px] text-[#707a8c] mb-1">Z-Range</div>
                <div className="text-xl font-mono text-[#e0e6ed]">102m - 148m</div>
              </div>

              <div className="stat-card">
                <div className="text-[11px] text-[#707a8c] mb-1">Processing Rate</div>
                <div className="text-xl font-mono text-[#e0e6ed]">2.4M p/s</div>
              </div>
            </div>

            <div className="text-[11px] uppercase tracking-[1px] text-[#707a8c] mt-10 mb-4 font-bold">Visualization</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span>Color by Elevation</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Show Normals</span>
                <Switch />
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-[40px] bg-[#14161b] border-t border-[#2d333d] flex items-center px-6 text-[11px] text-[#707a8c] gap-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff95] shadow-[0_0_8px_#00ff95]" />
          <span>System Ready</span>
        </div>
        <div>CPU: 24%</div>
        <div>GPU: 68%</div>
        <div>RAM: 8.2GB / 32GB</div>
        <div className="ml-auto">v4.2.1-stable</div>
      </footer>
    </div>
  );
}
