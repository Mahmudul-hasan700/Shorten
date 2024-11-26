"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface AnalyticsData {
  labels: string[];
  data: number[];
  totalClicks: number;
  growth: number;
}

interface TransformedData {
  name: string;
  clicks: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}> = ({ title, value, change, icon }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold">{value}</h3>
          <div className="mt-2 flex items-center">
            {change > 0 ? (
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span
              className={`text-sm ${change > 0 ? "text-green-500" : "text-red-500"}`}>
              {Math.abs(change)}%
            </span>
          </div>
        </div>
        <div className="rounded-full bg-primary/10 p-3">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] =
    useState<AnalyticsData | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `/api/analytics?range=${timeRange}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        } else {
          console.error("Failed to fetch analytics data.");
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (!mounted || !analyticsData) return <p>Loading...</p>;

  const transformedData: TransformedData[] = analyticsData.labels.map(
    (label, index) => ({
      name: label,
      clicks: analyticsData.data[index]
    })
  );

  const isDark = theme === "dark";
  const colors = {
    text: isDark ? "#FFFFFF" : "#000000",
    grid: isDark ? "#374151" : "#E5E7EB",
    bar: isDark ? "#60A5FA" : "#3B82F6",
    background: isDark ? "#1F2937" : "#FFFFFF"
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Clicks"
          value={(analyticsData.totalClicks ?? 0).toLocaleString()}
          change={analyticsData.growth}
          icon={<Activity className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Average Daily Clicks"
          value={(
            analyticsData.totalClicks /
            Math.max(analyticsData.labels.length, 1)
          ).toFixed(0)}
          change={analyticsData.growth}
          icon={<Activity className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Peak Clicks"
          value={Math.max(...analyticsData.data).toLocaleString()}
          change={analyticsData.growth}
          icon={<Activity className="h-6 w-6 text-primary" />}
        />
      </div>

      <Card className="w-full transition-colors duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clicks Overview</CardTitle>
              <CardDescription>
                A detailed view of user engagement over time
              </CardDescription>
            </div>
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="90d">90D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4 h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={transformedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30
                }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: colors.text }}
                  tickLine={{ stroke: colors.text }}
                  axisLine={{ stroke: colors.text }}
                />
                <YAxis
                  tick={{ fill: colors.text }}
                  tickLine={{ stroke: colors.text }}
                  axisLine={{ stroke: colors.text }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.background,
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                  labelStyle={{
                    color: colors.text
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: colors.text
                  }}
                />
                <Bar
                  dataKey="clicks"
                  name="Clicks"
                  fill={colors.bar}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
