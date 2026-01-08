import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { RevenueTrendChart } from "@/features/dashboard/components/RevenueTrendChart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Globe, Wallet, CreditCard, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Financials() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState("total");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancials() {
      setLoading(true);
      try {
        const [trendRes, unifiedRes] = await Promise.all([
          api.get("analytics/sales", { params: {} }),
          api.get("analytics/revenue", { params: { period } })
        ]);
        
        setData({ 
          trend: trendRes.data || { dates: [], inr_values: [], usd_values: [] }, 
          unified: unifiedRes.data?.data || {} 
        });
      } catch (err: any) {
        console.error("Financial fetch error:", err);
        setData({ 
          trend: { dates: [], inr_values: [], usd_values: [] }, 
          unified: {} 
        });
      } finally {
        setLoading(false);
      }
    }
    fetchFinancials();
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Intelligence</h2>
          <p className="text-muted-foreground text-sm">Revenue breakdown by gateway and currency.</p>
        </div>

        <Tabs defaultValue="total" onValueChange={(val) => setPeriod(val)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Day</TabsTrigger>
            <TabsTrigger value="weekly">Week</TabsTrigger>
            <TabsTrigger value="monthly">Month</TabsTrigger>
            <TabsTrigger value="total">Total</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="Stripe (USD)" 
              value={`$${data?.unified?.STRIPE?.[0]?.metrics?.gross || 0}`} 
              icon={<Globe />} 
              description={`${period} international gross`}
            />
            <StatCard 
              title="Razorpay (INR)" 
              value={`₹${data?.unified?.RAZORPAY?.[0]?.metrics?.gross || 0}`} 
              icon={<Wallet />} 
              description={`${period} domestic gross`}
            />
            <StatCard 
              title="App Stores" 
              value={`$${(data?.unified?.APPLE?.[0]?.metrics?.gross || 0) + (data?.unified?.GOOGLE?.[0]?.metrics?.gross || 0)}`} 
              icon={<CreditCard />} 
              description="Apple & Google combined"
            />
          </div>

          {data?.trend && data.trend.dates && data.trend.dates.length > 0 && (
            <RevenueTrendChart data={data.trend} />
          )}
        </>
      )}
    </div>
  );
}
