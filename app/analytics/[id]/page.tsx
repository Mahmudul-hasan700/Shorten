"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  TrendingUp,
  Globe,
  Link2
} from "lucide-react";

interface AnalyticsData {
  labels: string[];
  data: number[];
  totalClicks: number;
  growth: number;
  topCountries: [string, number][];
  topReferrers: [string, number][];
}

export default function UrlAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { data: session } = useSession();
  const params = useParams();
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    if (session && params.id) {
      fetchAnalytics();
    }
  }, [session, params.id, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/analytics?urlId=${params.id}&range=${timeRange}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  if (!analyticsData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-gray-500">
          Loading analytics...
        </div>
      </div>
    );
  }

  const chartData = analyticsData.labels.map((label, index) => ({
    name: label,
    clicks: analyticsData.data[index]
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          URL Performance Analytics
        </h1>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalyticCard 
          icon={<TrendingUp className="text-blue-500" />}
          title="Total Clicks"
          value={analyticsData.totalClicks.toLocaleString()}
          subtitle={`${analyticsData.growth >= 0 ? '+' : ''}${analyticsData.growth.toFixed(2)}% growth`}
        />

        <AnalyticCard 
          icon={<Globe className="text-green-500" />}
          title="Top Country"
          value={analyticsData.topCountries[0]?.[0] || 'N/A'}
          subtitle={`${analyticsData.topCountries[0]?.[1] || 0} clicks`}
        />

        <AnalyticCard 
          icon={<Link2 className="text-purple-500" />}
          title="Top Referrer"
          value={analyticsData.topReferrers[0]?.[0] || 'Direct'}
          subtitle={`${analyticsData.topReferrers[0]?.[1] || 0} clicks`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Click Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f9f9f9', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.topReferrers.map(([referrer, count]) => (
              <div 
                key={referrer} 
                className="flex justify-between py-2 border-b last:border-b-0"
              >
                <span className="text-gray-700 truncate">{referrer || 'Direct'}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.topCountries.map(([country, count]) => (
              <div 
                key={country} 
                className="flex justify-between py-2 border-b last:border-b-0"
              >
                <span className="text-gray-700">{country}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Reusable Analytic Card Component
function AnalyticCard({
  icon,
  title,
  value,
  subtitle
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}