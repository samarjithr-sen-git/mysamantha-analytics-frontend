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
        
        // Fetch all data in parallel
        const [dauRes, wauRes, revRes, featRes, streakRes] = await Promise.all([
          api.get("analytics/active-users/daily/"),
          api.get("analytics/active-users/weekly/"),
          api.get("analytics/revenue/", { params: { period: "daily" } }),
          api.get("analytics/popular/feature/"),
          api.get("analytics/streak/")
        ]);

        // 1. Map Activity Metrics
        const dau = dauRes.data?.daily_active_users || 0;
        const wau = wauRes.data?.weekly_active_users_count || 0; 
        
        // --- REVENUE CALCULATION FIX ---
        const revenuePayload = revRes.data?.data || {};
        
        // Initialize two separate buckets
        let totalINR = 0;
        let totalUSD = 0;

        // Iterate through ALL gateways (Stripe, Razorpay, GPay, etc.)
        Object.values(revenuePayload).forEach((gatewayEntries: any) => {
          // gatewayEntries is an array of currency objects
          gatewayEntries.forEach((entry: any) => {
            const amount = entry.metrics?.gross || 0;
            const currency = entry.currency?.toUpperCase(); // Ensure "USD" matches "usd"

            if (currency === "INR") {
              totalINR += amount;
            } else if (currency === "USD") {
              totalUSD += amount;
            }
            // If you have other currencies (EUR, GBP), you can add 'else if' here
          });
        });

        setData({
          dau,
          wau,
          stickiness: wau > 0 ? ((dau / wau) * 100).toFixed(1) : 0,
          // Store both values separately
          revenueINR: totalINR,
          revenueUSD: totalUSD,
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
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Hydrating System Metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mx-auto max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground font-medium">
          Real-time insights for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Row 1: Key Metrics */}
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
          description="DAU / WAU Ratio"
        />
        
        {/* UPDATED REVENUE CARD */}
        <StatCard 
          title="Daily Revenue" 
          // Show both INR and USD separated by a slash
          value={
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-xl">
                ₹{data.revenueINR.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xl  font-bold">
                + ${data.revenueUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          } 
          icon={<DollarSign className="text-emerald-500" />} 
          description="Gross Volume (INR + USD)"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border bg-card p-4 shadow-sm">
          <FeaturePopularityChart data={data.ranking} />
        </div>
        <div className="lg:col-span-3 rounded-xl border bg-card p-4 shadow-sm">
          <StreakDonutChart data={data.streaks} />
        </div>
      </div>
    </div>
  );
}