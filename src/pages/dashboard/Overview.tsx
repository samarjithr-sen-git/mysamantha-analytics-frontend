import { useEffect, useState } from "react";
import { 
  Users, 
  DollarSign, 
  Zap, 
  TrendingUp, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { FeaturePopularityChart } from "@/features/dashboard/components/FeatureChart";
import { StreakDonutChart } from "@/features/dashboard/components/StreakDonutChart"; 
import api from "@/lib/axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Overview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllAnalytics() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch analytics data with proper error handling
        const [dauRes, wauRes, revRes, featRes, streakRes] = await Promise.all([
          api.get("analytics/active-users/daily"),
          api.get("analytics/active-users/weekly"),
          api.get("analytics/revenue", { params: { period: "daily" } }),
          api.get("analytics/popular/feature"),
          api.get("analytics/streak")
        ]);

        const dau = dauRes.data?.daily_active_users || 0;
        const wau = wauRes.data?.weekly_active_users || 0;
        
        // Safely extract revenue data
        const revenueData = revRes.data?.data || {};
        const razorpayGross = revenueData.RAZORPAY?.[0]?.metrics?.gross || 0;

        setData({
          dau,
          wau,
          // Stickiness Ratio: Percentage of weekly users active today
          stickiness: wau > 0 ? ((dau / wau) * 100).toFixed(1) : 0,
          revenue: razorpayGross,
          ranking: featRes.data?.ranking || [],
          streaks: streakRes.data || { labels: [], counts: [0, 0, 0, 0] },
        });
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || err.message || "Unknown error";
        setError(`Failed to sync with Zemuria Analytics: ${errorMsg}`);
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Hydrating Analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground">Real-time user engagement and revenue</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Daily Active (DAU)" 
          value={data.dau} 
          icon={<Users className="text-blue-500" />} 
          description="Unique logins today"
        />
        <StatCard 
          title="Weekly Active (WAU)" 
          value={data.wau} 
          icon={<TrendingUp className="text-purple-500" />} 
          description="Active in last 7 days"
        />
        <StatCard 
          title="Stickiness" 
          value={`${data.stickiness}%`} 
          icon={<Zap className="text-amber-500" />} 
          description="DAU/WAU Ratio"
        />
        <StatCard 
          title="Daily Revenue" 
          value={`₹${data.revenue.toLocaleString()}`} 
          icon={<DollarSign className="text-emerald-500" />} 
          description="Razorpay Gross"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <FeaturePopularityChart data={data.ranking} />
        </div>
        <div className="lg:col-span-3">
          <StreakDonutChart data={data.streaks} />
        </div>
      </div>
    </div>
  );
}