"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  BarChart2,
  PieChart as PieChartIcon,
  Globe,
  Link
} from "lucide-react";

interface AnalyticsData {
  totalClicks: number;
  growth: number;
  labels: string[];
  data: number[];
  deviceBreakdown: Record<string, number>;
  topReferrers: [string, number][];
  topCountries: [string, number][];
  browserBreakdown: Record<string, number>;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8"
];

export default function UrlAnalyticsPage() {
  const [analyticsData, setAnalyticsData] =
    useState<AnalyticsData | null>(null);
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

  if (!analyticsData)
    return (
      <div className="py-10 text-center">Loading analytics...</div>
    );

  const deviceData = Object.entries(
    analyticsData.deviceBreakdown
  ).map(([name, value]) => ({ name, value }));

  const browserData = Object.entries(
    analyticsData.browserBreakdown
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          URL Analytics
        </h1>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <BarChart2 className="mr-2 h-5 w-5 text-muted-foreground" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalClicks}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.growth > 0 ? "+" : ""}
              {analyticsData.growth.toFixed(2)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Globe className="mr-2 h-5 w-5 text-muted-foreground" />
              Top Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.topCountries[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.topCountries[0]?.[1]} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Link className="mr-2 h-5 w-5 text-muted-foreground" />
              Top Referrer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="truncate text-xl font-bold">
              {analyticsData.topReferrers[0]?.[0] || "Direct"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.topReferrers[0]?.[1]} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analyticsData.labels.map((label, index) => ({
                  name: label,
                  clicks: analyticsData.data[index]
                }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }>
                    {deviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {analyticsData.topReferrers.map(([referrer, count]) => (
                <li
                  key={referrer}
                  className="flex justify-between border-b py-2 last:border-b-0">
                  <span className="truncate">
                    {referrer || "Direct"}
                  </span>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={browserData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }>
                  {browserData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
