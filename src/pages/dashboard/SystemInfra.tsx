import { useEffect, useState } from "react";
import { 
  Server, 
  Database, 
  Smartphone, 
  LineChart as LineIcon, 
  Loader2, 
  CheckCircle2,
  XCircle
} from "lucide-react";
import api from "@/lib/axios";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b'];

export default function SystemInfra() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystemData() {
      try {
        const [storageRes, deviceRes, salesRes, retentionRes] = await Promise.all([
          api.get("/analytics/storage/"),
          api.get("/analytics/device/"),
          api.get("/analytics/sales/"),
          api.get("/analytics/retention/")
        ]);

        // Formatting Sales Data for Line Chart
        const formattedSales = salesRes.data.dates.map((date: string, i: number) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          INR: salesRes.data.inr_values[i],
          USD: salesRes.data.usd_values[i]
        }));

        // Formatting Storage Data
        const formattedStorage = storageRes.data.labels.map((label: string, i: number) => ({
          type: label,
          size: storageRes.data.data[i]
        }));

        // Formatting Device Data
        const formattedDevices = deviceRes.data.labels.map((label: string, i: number) => ({
          name: label,
          value: deviceRes.data.data[i]
        }));

        setData({
          storage: formattedStorage,
          devices: formattedDevices,
          sales: formattedSales,
          retention: retentionRes.data
        });
      } catch (err) {
        console.error("Infrastructure sync failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSystemData();
  }, []);

  if (loading) return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System & Infrastructure</h2>
        <p className="text-muted-foreground">Server-side resources and platform health</p>
      </div>

      {/* Row 1: Sales Trend (Multi-Currency) */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Daily gross sales volume (INR vs USD)</CardDescription>
          </div>
          <LineIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.sales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="INR" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="USD" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 2. Storage Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Storage Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.storage}>
                <XAxis dataKey="type" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip labelClassName="text-black" />
                <Bar dataKey="size" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Size (MB)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Device Ecosystem */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Device Distribution</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.devices}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.devices.map((_:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Subscription Retention (Auto-Renew) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Subscription Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[250px] space-y-6">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Auto-Renew ON</span>
              </div>
              <span className="text-xl font-bold text-emerald-600">{data.retention.data[0]}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-rose-600" />
                <span className="text-sm font-medium text-rose-900">Auto-Renew OFF</span>
              </div>
              <span className="text-xl font-bold text-rose-600">{data.retention.data[1]}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}