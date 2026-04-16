import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  HardDrive, 
  Cpu, 
  FileJson, 
  FileSpreadsheet, 
  FileCode,
  Box,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LIDAR_DEVICES, exportLidarData, LidarPoint } from '@/src/lib/lidar-utils';

interface DataManagementProps {
  points: LidarPoint[];
  onImport: (newPoints: LidarPoint[]) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ points, onImport }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'las' | 'csv' | 'json' | 'ply' | 'stl'>('las');

  const handleImport = () => {
    setIsImporting(true);
    // Simulate import delay
    setTimeout(() => {
      setIsImporting(false);
      // In a real app, we'd parse the file/stream here
      onImport(points); // For now just "re-import" or refresh
    }, 2000);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const blob = exportLidarData(points, exportFormat);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_data_${new Date().getTime()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 1500);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Import Dialog */}
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm" className="bg-[#1c1f26] border-[#2d333d] text-[#e0e6ed] text-[11px] uppercase tracking-widest hover:bg-[#2d333d]" />}>
          <Upload className="w-3.5 h-3.5 mr-2 text-primary" /> Import Data
        </DialogTrigger>
        <DialogContent className="bg-[#14161b] border-[#2d333d] text-[#e0e6ed]">
          <DialogHeader>
            <DialogTitle className="text-primary uppercase tracking-widest text-sm">Import Raw LiDAR Data</DialogTitle>
            <DialogDescription className="text-[#707a8c] text-xs">
              Select a source device or upload a raw point cloud file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wider text-[#707a8c]">Source Device</Label>
              <Select onValueChange={setSelectedDevice}>
                <SelectTrigger className="bg-[#1c1f26] border-[#2d333d]">
                  <SelectValue placeholder="Select device..." />
                </SelectTrigger>
                <SelectContent className="bg-[#14161b] border-[#2d333d] text-[#e0e6ed]">
                  {LIDAR_DEVICES.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-primary" />
                        <span>{device.name}</span>
                        <span className="text-[10px] opacity-50">({device.type})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wider text-[#707a8c]">Local File</Label>
              <div className="flex gap-2">
                <Input type="file" className="bg-[#1c1f26] border-[#2d333d] text-xs cursor-pointer" />
              </div>
            </div>

            {selectedDevice && (
              <div className="p-3 rounded bg-primary/5 border border-primary/20 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className="text-[10px] text-primary font-mono uppercase">
                  Device Connection: STABLE | Ready for stream
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="bg-primary text-background hover:bg-primary/90 font-bold uppercase tracking-widest text-[11px] w-full"
            >
              {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <HardDrive className="w-4 h-4 mr-2" />}
              {isImporting ? 'Initializing Stream...' : 'Start Ingestion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm" className="bg-[#1c1f26] border-[#2d333d] text-[#e0e6ed] text-[11px] uppercase tracking-widest hover:bg-[#2d333d]" />}>
          <Download className="w-3.5 h-3.5 mr-2 text-primary" /> Export
        </DialogTrigger>
        <DialogContent className="bg-[#14161b] border-[#2d333d] text-[#e0e6ed]">
          <DialogHeader>
            <DialogTitle className="text-primary uppercase tracking-widest text-sm">Export Processed Data</DialogTitle>
            <DialogDescription className="text-[#707a8c] text-xs">
              Choose the output format for your processed point cloud.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'las', name: 'LAS Binary', icon: <Box className="w-4 h-4" /> },
                { id: 'csv', name: 'CSV Table', icon: <FileSpreadsheet className="w-4 h-4" /> },
                { id: 'json', name: 'JSON Data', icon: <FileJson className="w-4 h-4" /> },
                { id: 'ply', name: 'PLY Mesh', icon: <FileCode className="w-4 h-4" /> },
                { id: 'stl', name: 'STL 3D Print', icon: <Layers className="w-4 h-4" /> },
              ].map((format) => (
                <button
                  key={format.id}
                  onClick={() => setExportFormat(format.id as any)}
                  className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                    exportFormat === format.id 
                      ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,242,255,0.1)]' 
                      : 'border-[#2d333d] bg-[#1c1f26] text-[#707a8c] hover:border-[#707a8c]'
                  }`}
                >
                  {format.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{format.name}</span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="bg-primary text-background hover:bg-primary/90 font-bold uppercase tracking-widest text-[11px] w-full"
            >
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {isExporting ? 'Generating Package...' : `Export as ${exportFormat.toUpperCase()}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
