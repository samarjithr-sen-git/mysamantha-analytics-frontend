import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export function RevenueTrendChart({ data, period }: { data: any, period: string }) {
  // We transform the backend's three separate lists into one list of objects
  const chartData = data.dates.map((date: string, i: number) => ({
    displayDate: date, // e.g., "10 AM" or "Mon"
    INR: data.inr_values[i],
    USD: data.usd_values[i],
  }));

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorInr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tickMargin={10}
            // Logic to prevent label crowding:
            // If we have many points (like in Total), skip every few labels
            interval={period === 'total' ? Math.floor(chartData.length / 6) : 0} 
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
            formatter={(value: number) => [value.toLocaleString(), 'Revenue']}
          />
          <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
          <Area 
            type="monotone" // This makes the line smooth and curvy
            dataKey="INR" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorInr)" 
            strokeWidth={3}
            animationDuration={1500}
          />
          <Area 
            type="monotone" 
            dataKey="USD" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorUsd)" 
            strokeWidth={3}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}