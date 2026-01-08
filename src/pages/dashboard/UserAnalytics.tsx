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

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

export default function UserAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserIntelligence() {
      try {
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
          churnRisk: Array.isArray(churnRes.data) ? churnRes.data : churnRes.data[0] || []
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

  // Formatting Usage Data for Pie Chart
  const pieData = data.usageBuckets.labels.map((label: string, i: number) => ({
    name: label,
    value: data.usageBuckets.data[i]
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Intelligence</h2>
        <p className="text-muted-foreground">Behavioral segmentation and geographic distribution</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* 1. Timezone Distribution - Using your new endpoint */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Global Distribution</CardTitle>
              <CardDescription>Users grouped by timezone</CardDescription>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timezones} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis dataKey="timezone" type="category" fontSize={11} width={100} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="user_count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Usage Categorization Pie */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Personas</CardTitle>
              <CardDescription>Tool call volume segments</CardDescription>
            </div>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePie>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePie>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
               {pieData.map((entry: any, i: number) => (
                 <div key={i} className="flex items-center gap-1 text-[10px] font-medium">
                   <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                   {entry.name}
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. VIP Spenders Leaderboard */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>Top Spenders</CardTitle>
            </div>
            <CardDescription>Top 10 users by monthly & purchased tool calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.vips.map((vip: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{vip.user__email}</span>
                    <span className="text-xs text-muted-foreground">Credits: {vip.current_credits}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">{vip.total_usage}</span>
                    <p className="text-[10px] text-muted-foreground uppercase">Calls</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Churn Risk Alert */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-destructive" />
              <CardTitle>Churn Risk</CardTitle>
            </div>
            <CardDescription>High-streak users who ghosted</CardDescription>
          </CardHeader>
          <CardContent>
            {data.churnRisk.length > 0 ? (
              <div className="space-y-4">
                {data.churnRisk.map((user: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{user.user__email}</p>
                      <p className="text-[10px] text-muted-foreground">Peak Streak: {user.max_streak} days</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-sm text-muted-foreground">No high-risk churn detected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}