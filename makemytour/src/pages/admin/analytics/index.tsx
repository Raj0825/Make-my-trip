import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import { getAnalytics } from "@/api";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Activity,
  ArrowRight,
  Plane,
  Building2,
  TrainFront,
  Bus,
  Car,
  Home
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  revenueByService: Record<string, number>;
  bookingsByService: Record<string, number>;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, verify admin session here.
    // We'll just fetch data.
    const fetchData = async () => {
      try {
        const result = await getAnalytics();
        setData(result);
      } catch (error) {
        console.error("Error fetching analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-red-500 font-medium text-lg">Failed to load analytics data.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹ ${val.toLocaleString("en-IN")}`;

  const serviceIcons: Record<string, React.ReactNode> = {
    Flight: <Plane className="w-5 h-5 text-blue-500" />,
    Hotel: <Building2 className="w-5 h-5 text-indigo-500" />,
    Train: <TrainFront className="w-5 h-5 text-emerald-500" />,
    Bus: <Bus className="w-5 h-5 text-amber-500" />,
    Cab: <Car className="w-5 h-5 text-rose-500" />,
    Homestay: <Home className="w-5 h-5 text-cyan-500" />
  };

  const getServiceIcon = (key: string) => serviceIcons[key] || <Activity className="w-5 h-5 text-gray-500" />;

  // Sort services by revenue
  const sortedServices = Object.entries(data.revenueByService)
    .sort((a, b) => b[1] - a[1]);

  const maxRevenue = sortedServices.length > 0 ? sortedServices[0][1] : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Platform performance and booking metrics overview.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm bg-white border shadow-sm px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
              <TrendingUp className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mr-4">
              <CreditCard className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.totalBookings.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mr-4">
              <Users className="text-purple-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Registered Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <PieChart className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Revenue by Category</h2>
            </div>
            
            {sortedServices.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No revenue data available.</p>
            ) : (
              <div className="space-y-6">
                {sortedServices.map(([key, value]) => {
                  const percentage = maxRevenue > 0 ? (value / maxRevenue) * 100 : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {getServiceIcon(key)}
                          <span className="font-medium text-gray-700 ml-2">{key}</span>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(value)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Booking Volume */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <Activity className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Booking Volume</h2>
            </div>
            
            {Object.keys(data.bookingsByService).length === 0 ? (
              <p className="text-gray-500 text-center py-10">No booking data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 font-medium text-gray-500 text-sm">Service</th>
                      <th className="py-3 font-medium text-gray-500 text-sm text-right">Transactions</th>
                      <th className="py-3 font-medium text-gray-500 text-sm text-right">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.bookingsByService)
                      .sort((a, b) => b[1] - a[1])
                      .map(([key, count]) => {
                        const revenue = data.revenueByService[key] || 0;
                        const avg = count > 0 ? revenue / count : 0;
                        return (
                          <tr key={key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center">
                                {getServiceIcon(key)}
                                <span className="font-medium text-gray-800 ml-2">{key}</span>
                              </div>
                            </td>
                            <td className="py-4 text-right font-semibold text-gray-900">
                              {count.toLocaleString()}
                            </td>
                            <td className="py-4 text-right text-gray-600">
                              {formatCurrency(Math.round(avg))}
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
