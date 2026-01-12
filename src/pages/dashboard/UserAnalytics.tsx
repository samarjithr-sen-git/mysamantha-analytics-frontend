import { useEffect, useState } from "react";
import { 
  Globe, 
  Trophy, 
  UserMinus, 
  PieChart, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import api from "@/lib/axios";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart as RePie, Pie
} from 'recharts';

// --- Types ---
interface ChurnUser {
  user__email: string;
  max_streak: number;
  last_interaction_date: string | null;
}

interface VipUser {
  user__email: string;
  current_credits: number;
  total_usage: number;
}

interface AnalyticsData {
  timezones: { timezone: string; user_count: number }[];
  topTimezone: string;
  vips: VipUser[];
  usageBuckets: { labels: string[]; data: number[] };
  churnRisk: ChurnUser[];
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

export default function UserAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserIntelligence() {
      try {
        setLoading(true);
        const [tzRes, vipRes, usageRes, churnRes] = await Promise.all([
          api.get("/analytics/top-timezone/"),
          api.get("/analytics/top-users/"),
          api.get("/analytics/top-tool-callers/"),
          api.get("/analytics/churn-risk/")
        ]);

        setData({
          timezones: tzRes.data.all_timezones || [],
          topTimezone: tzRes.data.timezone_with_most_users,
          vips: vipRes.data || [],
          usageBuckets: usageRes.data || { labels: [], data: [] },
          // ✅ CLEAN FIX: Directly assign data (backend tuple bug fixed)
          churnRisk: churnRes.data || []
        });
      } catch (err) {
        console.error("Failed to fetch user analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserIntelligence();
  }, []);

  if (loading) return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!data) return null;

  // Formatting Usage Data for Pie Chart
  const pieData = data.usageBuckets.labels.map((label: string, i: number) => ({
    name: label,
    value: data.usageBuckets.data[i] || 0
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">User Intelligence</h2>
        <p className="text-muted-foreground font-medium">Behavioral segmentation and geographic distribution</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* 1. Timezone Distribution */}
        <Card className="lg:col-span-4 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Global Distribution</CardTitle>
              <CardDescription>Active users grouped by local timezone</CardDescription>
            </div>
            <Globe className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timezones} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="timezone" type="category" fontSize={11} width={110} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.04)'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="user_count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Usage Categorization Pie */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">User Personas</CardTitle>
              <CardDescription>Tool call volume segments</CardDescription>
            </div>
            <PieChart className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent className="h-[320px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="80%">
              <RePie>
                <Pie
                  data={pieData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {pieData.map((_:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </RePie>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
               {pieData.map((entry: any, i: number) => (
                 <div key={i} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                   <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                   {entry.name}
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. VIP Spenders Leaderboard */}
        <Card className="lg:col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Top Spenders</CardTitle>
            </div>
            <CardDescription>Top 10 users by historical tool call usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pr-2">
              {data.vips.length > 0 ? data.vips.map((vip, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-800">{vip.user__email}</span>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">Credits Left: {vip.current_credits}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-primary">{vip.total_usage.toLocaleString()}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Calls</p>
                  </div>
                </div>
              )) : <p className="text-center py-10 text-slate-400">No usage data found.</p>}
            </div>
          </CardContent>
        </Card>

        {/* 4. Churn Risk Alert */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-lg text-rose-600">Churn Risk</CardTitle>
            </div>
            <CardDescription>High-streak users currently inactive</CardDescription>
          </CardHeader>
          <CardContent>
            {data.churnRisk.length > 0 ? (
              <div className="space-y-3">
                {data.churnRisk.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 group hover:bg-rose-100 transition-colors">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-rose-900 truncate">
                        {user.user__email}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-200/50 px-1.5 rounded">
                          Peak: {user.max_streak} Days
                        </span>
                        <span className="text-[10px] font-medium text-rose-600">
                           {user.last_interaction_date 
                             ? `Last: ${new Date(user.last_interaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
                             : 'Date Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div className="p-3 bg-emerald-50 rounded-full">
                   <AlertTriangle className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-slate-500">No high-risk churn detected.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}