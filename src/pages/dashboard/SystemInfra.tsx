import { useEffect, useState } from "react";
import {
  Server,
  Database,
  Smartphone,
  LineChart as LineIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  HardDrive,
  Files,
  Trash2,
  Activity,
} from "lucide-react";
import api from "@/lib/axios";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#10b981", "#f43f5e", "#3b82f6", "#f59e0b"];

const STORAGE_COLORS: Record<string, string> = {
  Active: "#10b981", // Emerald Green
  Deleted: "#f43f5e", // Rose Red (Signifies billed retention/waste)
  Total: "#3b82f6", // Blue
};

export default function SystemInfra() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystemData() {
      try {
        setLoading(true);
        const [storageRes, deviceRes, salesRes, retentionRes] =
          await Promise.all([
            api.get("/analytics/storage/"), // Now returns Wasabi Stats
            api.get("/analytics/device/"),
            api.get("/analytics/sales/"),
            api.get("/analytics/retention/"),
          ]);

        // 1. Formatting Sales Data
        const formattedSales = salesRes.data.dates.map(
          (date: string, i: number) => ({
            date: date, // Using the formatted string from Django
            INR: salesRes.data.inr_values[i],
            USD: salesRes.data.usd_values[i],
          })
        );

        // 2. Formatting Wasabi Storage for the Bar Chart
        // We'll show Active vs Deleted vs Total
        const formattedStorage = [
          { name: "Active", size: storageRes.data.active_storage_gb },
          { name: "Deleted", size: storageRes.data.deleted_storage_gb },
          { name: "Total", size: storageRes.data.total_storage_gb },
        ];

        // 3. Formatting Device Data
        const formattedDevices = deviceRes.data.labels.map(
          (label: string, i: number) => ({
            name: label,
            value: deviceRes.data.data[i],
          })
        );

        setData({
          storage: formattedStorage,
          rawStorage: storageRes.data, // Keep raw for StatCards
          devices: formattedDevices,
          sales: formattedSales,
          retention: retentionRes.data,
        });
      } catch (err) {
        console.error("Infrastructure sync failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSystemData();
  }, []);

  if (loading)
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">
          System & Infrastructure
        </h2>
        <p className="text-muted-foreground font-medium uppercase tracking-tight text-xs">
          Wasabi Cloud & Platform Health
        </p>
      </div>

      {/* Row 1: Wasabi Real-time StatCards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Bucket Size"
          value={`${data.rawStorage?.total_storage_gb || 0} GB`}
          icon={<HardDrive className="text-orange-500" />}
          description="Total Wasabi usage"
        />
        <StatCard
          title="Total Objects"
          value={data.rawStorage?.object_count?.toLocaleString() || "0"}
          icon={<Files className="text-blue-500" />}
          description="Files in samantha bucket"
        />
        <StatCard
          title="Active Data"
          value={`${data.rawStorage?.active_storage_gb || 0} GB`}
          icon={<Activity className="text-emerald-500" />}
          description="Non-deleted files"
        />
        <StatCard
          title="Deleted Pending"
          value={`${data.rawStorage?.deleted_storage_gb || 0} GB`}
          icon={<Trash2 className="text-red-500" />}
          description="90-day billed retention"
        />
      </div>

      {/* Row 2: Sales Trend */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>
              Roll-up of domestic and international sales
            </CardDescription>
          </div>
          <LineIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.sales}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="INR"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="USD"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 2. Storage Detailed Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Storage Allocation</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.storage}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="size" radius={[4, 4, 0, 0]} name="Size (GB)">
                  {/* ADD THIS MAP LOGIC HERE */}
                  {data.storage.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STORAGE_COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Bar>
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
                  {data.devices.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Subscription Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Subscription Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[250px] space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">
                  Auto-Renew ON
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-600">
                {data.retention.data[0]}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-rose-600" />
                <span className="text-sm font-semibold text-rose-900">
                  Auto-Renew OFF
                </span>
              </div>
              <span className="text-xl font-bold text-rose-600">
                {data.retention.data[1]}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
