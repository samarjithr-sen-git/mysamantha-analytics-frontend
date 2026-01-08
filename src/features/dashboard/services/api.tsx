import api from "@/lib/axios";

export const getRevenueData = async (period = 'total') => {
  // Matches your UnifiedRevenueView(APIView)
  const { data } = await api.get(`/analytics/revenue/?period=${period}`);
  return data;
};

export const getSalesTrend = async () => {
  // Matches your SalesAnalyticsView(APIView)
  const { data } = await api.get('/analytics/sales/');
  return data;
};

export const getStreakData = async () => {
  // Matches your StreakAnalyticsView(APIView)
  const { data } = await api.get('/analytics/streak/');
  return data;
};