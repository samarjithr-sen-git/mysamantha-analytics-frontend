import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { RevenueTrendChart } from "@/features/dashboard/components/RevenueTrendChart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Wallet, CreditCard, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Financials() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState("daily"); // Default to the 24h rolling view
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancials() {
      setLoading(true);
      try {
        // We pass the 'period' to BOTH endpoints so the graph and cards match
        const [trendRes, unifiedRes] = await Promise.all([
          api.get("/analytics/sales/", { params: { period } }),
          api.get("/analytics/revenue/", { params: { period } })
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
  }, [period]); // This re-fetches data every time the user clicks a different tab

  /**
   * Helper to sum gross revenue for a specific gateway.
   * Handles the array structure: [ {currency: 'USD', metrics: {...}}, {currency: 'INR', ...} ]
   */
  const sumGross = (gateway: string, targetCurrency?: string) => {
    const entries = data?.unified?.[gateway];
    if (!entries || !Array.isArray(entries)) return 0;

    return entries
      .filter((e: any) => !targetCurrency || e.currency === targetCurrency)
      .reduce((acc: number, curr: any) => acc + (parseFloat(curr.metrics?.gross) || 0), 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Financial Intelligence</h2>
          <p className="text-muted-foreground text-sm font-medium tracking-tight uppercase">
            {period === 'daily' ? 'Last 24 Hours' : `${period} View`}
          </p>
        </div>

        <Tabs value={period} onValueChange={(val) => setPeriod(val)} className="w-full md:w-[400px]">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1">
            <TabsTrigger value="daily">Day</TabsTrigger>
            <TabsTrigger value="weekly">Week</TabsTrigger>
            <TabsTrigger value="monthly">Month</TabsTrigger>
            <TabsTrigger value="total">Total</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex h-[400px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
          <span className="text-sm font-medium text-muted-foreground">Syncing Ledger...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="Stripe (USD)" 
              value={`$${sumGross("STRIPE").toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
              icon={<Globe className="text-blue-600" />} 
              description="International gross volume"
            />

            <StatCard 
              title="Razorpay (INR)" 
              value={`₹${sumGross("RAZORPAY", "INR").toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
              icon={<Wallet className="text-emerald-600" />} 
              description="Domestic gross volume"
            />

            <StatCard 
              title="App Stores" 
              value={`$${(sumGross("APPLE", "USD") + sumGross("GOOGLE", "USD")).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
              icon={<CreditCard className="text-indigo-600" />} 
              description={`USD: $${(sumGross("APPLE", "USD") + sumGross("GOOGLE", "USD")).toLocaleString(undefined, { minimumFractionDigits: 2 })} | INR: ₹${(sumGross("APPLE", "INR") + sumGross("GOOGLE", "INR")).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Revenue Timeline</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Aggregated by {period === 'daily' ? 'Hour' : period === 'total' ? 'Month' : 'Day'}
              </p>
            </div>
            
            {data?.trend?.dates?.length > 0 ? (
              <RevenueTrendChart data={data.trend} period={period} />
            ) : (
              <div className="flex h-[300px] items-center justify-center border-2 border-dashed rounded-lg bg-slate-50">
                <p className="text-sm text-muted-foreground">No transaction history found for this window.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}