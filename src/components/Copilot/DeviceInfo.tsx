import { useState, useEffect } from "react";
import { 
  Monitor, 
  Cpu, 
  Database, 
  HardDrive, 
  Zap, 
  Activity, 
  RefreshCcw,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function DeviceInfo() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/system-info');
      if (!response.ok) throw new Error("Failed to fetch system info");
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Scanning system resources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
        <p>Error: {error}</p>
        <Button onClick={fetchData} variant="outline">Retry</Button>
      </div>
    );
  }

  const memUsage = data ? (data.memory.used / data.memory.total) * 100 : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto h-full custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">System Intelligence</h2>
          <p className="text-muted-foreground">Hardware telemetry and resource allocation</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10"
            onClick={async () => {
              try {
                await fetch('/api/terminal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ command: 'gemini analyze .' })
                });
                alert('Analysis started in background. Check terminal for output.');
              } catch (e) {
                alert('Failed to start analysis');
              }
            }}
          >
            <Activity className="w-4 h-4" />
            Run Analysis
          </Button>
          <Button onClick={fetchData} disabled={loading} size="sm" className="gap-2">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
            <Cpu className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.cpu.manufacturer} {data?.cpu.brand}</div>
            <p className="text-xs text-muted-foreground">{data?.cpu.cores} Cores @ {data?.cpu.speed}GHz</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(memUsage)}%</div>
            <Progress value={memUsage} className="h-1.5 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(data?.memory.used / 1024 / 1024 / 1024)}GB / {Math.round(data?.memory.total / 1024 / 1024 / 1024)}GB
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating System</CardTitle>
            <Monitor className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.os.platform}</div>
            <p className="text-xs text-muted-foreground">{data?.os.distro} ({data?.os.release})</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Status</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.battery.hasBattery ? `${data.battery.percent}%` : 'AC Power'}</div>
            <p className="text-xs text-muted-foreground">
              {data?.battery.isCharging ? 'Charging' : (data?.battery.hasBattery ? 'Discharging' : 'Desktop System')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Storage Volumes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.storage.map((drive: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{drive.mount} ({drive.fs})</span>
                  <span className="text-muted-foreground">{Math.round(drive.use)}% full</span>
                </div>
                <Progress value={drive.use} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{Math.round(drive.used / 1024 / 1024 / 1024)} GB used</span>
                  <span>{Math.round(drive.size / 1024 / 1024 / 1024)} GB total</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              System Resources for AI
            </CardTitle>
            <CardDescription>Metrics reported to Gemini CLI for local execution</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                   <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-medium">Performance Profile</span>
                   </div>
                   <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">High Performance</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                   <div className="flex items-center gap-3">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium">Neural Capability</span>
                   </div>
                   <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">AVX2 Enabled</Badge>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                   <p className="text-xs leading-relaxed text-muted-foreground">
                      This system is identified as a <strong>{data?.os.hostname}</strong> running <strong>{data?.os.distro}</strong>. 
                      Gemini is currently authorized to utilize up to 80% of available memory for local reasoning tasks.
                   </p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
