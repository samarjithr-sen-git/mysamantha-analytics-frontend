import api from "@/lib/axios";

export const getDailyActiveUsers = async () => {
  const response = await api.get("/analytics/dau/"); // Matches your DRF endpoint
  return response.data;
};