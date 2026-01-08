import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  // Optional trend logic if your Django views provide comparison data later
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {/* We wrap the icon in a subtle primary color for that "Analytics" look */}
        <div className="h-4 w-4 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description || trend ? (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span className={cn(
                "font-medium mr-1", 
                trend.positive ? "text-emerald-600" : "text-rose-600"
              )}>
                {trend.positive ? "+" : "-"}{trend.value}
              </span>
            )}
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}