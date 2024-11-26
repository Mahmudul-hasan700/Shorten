"use client";

import React, { useEffect, useRef, useState } from "react";
import Globe from "@/components/ui/globe";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
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
  Globe as GlobeIcon,
  Link2,
  BarChart2,
  Copy,
  QrCode
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AnalyticsData {
  urlCode: string;
  originalUrl: string;
  labels: string[];
  data: number[];
  dailyClickData: Array<{ date: string; clicks: number }>;
  totalClicks: number;
  growth: number;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  topCountries: [string, number][];
  topReferrers: [string, number][];
  clickLocations: Array<{
    latitude: number;
    longitude: number;
    count: number;
  }>;
}

interface GlobeMarker {
  location: [number, number];
  size: number;
}

export default function UrlAnalyticsPage() {
  const [analyticsData, setAnalyticsData] =
    useState<AnalyticsData | null>(null);
  const { data: session } = useSession();
  const params = useParams();
  const [timeRange, setTimeRange] = useState("7d");
  const [globeMarkers, setGlobeMarkers] = useState<GlobeMarker[]>([]);

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

        // Create globe markers from click locations
        const markers = data.clickLocations.map(location => ({
          location: [location.latitude, location.longitude],
          size: Math.min(location.count / 10, 0.1)
        }));
        setGlobeMarkers(markers);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const copyUrlCode = () => {
    if (analyticsData?.urlCode) {
      navigator.clipboard.writeText(
        `${window.location.origin}/${analyticsData.urlCode}`
      );
      toast.success("Short URL copied to clipboard");
    }
  };

  const generateQRCode = () => {
    if (analyticsData?.urlCode) {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${window.location.origin}/${analyticsData.urlCode}`;
      window.open(qrCodeUrl, "_blank");
    }
  };

  if (!analyticsData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col items-center justify-between gap-3">
        <div className="flex flex-col items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-800">
            URL Performance Analytics
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={copyUrlCode}>
              <Copy className="mr-2 h-4 w-4" /> Copy Short URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateQRCode}>
              <QrCode className="mr-2 h-4 w-4" /> Generate QR Code
            </Button>
          </div>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="7d" className="w-full">7 Days</TabsTrigger>
            <TabsTrigger value="30d" className="w-full">30 Days</TabsTrigger>
            <TabsTrigger value="90d" className="w-full" >90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* URL Information */}
      <Card className="border-none bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="max-w-[600px] truncate text-xl font-semibold text-gray-800">
                Original URL: {analyticsData.originalUrl}
              </h2>
              <p className="text-sm text-gray-600">
                Short URL: {window.location.origin}/
                {analyticsData.urlCode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-none bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Clicks
            </CardTitle>
            <TrendingUp className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">
              {analyticsData.totalClicks.toLocaleString()}
            </div>
            <p
              className={`text-sm ${analyticsData.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {analyticsData.growth >= 0 ? "+" : ""}
              {analyticsData.growth.toFixed(2)}% growth
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Country
            </CardTitle>
            <GlobeIcon className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {analyticsData.topCountries[0]?.[0] || "N/A"}
            </div>
            <p className="text-sm text-gray-600">
              {analyticsData.topCountries[0]?.[1] || 0} clicks
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Referrer
            </CardTitle>
            <Link2 className="text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {analyticsData.topReferrers[0]?.[0] || "Direct"}
            </div>
            <p className="text-sm text-gray-600">
              {analyticsData.topReferrers[0]?.[1] || 0} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Clicks Chart */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 text-indigo-500" />
              Daily Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.dailyClickData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Browser Breakdown */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GlobeIcon className="mr-2 text-indigo-500" />
              Browser Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(analyticsData.browserBreakdown || {})
              .sort((a, b) => b[1] - a[1])
              .map(([browser, count]) => (
                <div
                  key={browser}
                  className="flex items-center justify-between border-b py-2 last:border-b-0">
                  <span className="capitalize text-gray-700">
                    {browser}
                  </span>
                  <div className="flex items-center">
                    <span className="mr-2 font-medium text-gray-900">
                      {count}
                    </span>
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{
                        width: `${(count / analyticsData.totalClicks) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Global Reach */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GlobeIcon className="mr-2 text-green-500" />
            Global Reach
          </CardTitle>
        </CardHeader>
        <CardContent className="relative aspect-square">
          <Globe
            markers={globeMarkers}
            config={{
              width: 800,
              height: 800,
              devicePixelRatio: 2,
              phi: 0,
              theta: 0,
              dark: 1,
              diffuse: 1.2,
              mapSamples: 16000,
              mapBrightness: 6,
              baseColor: [0.1, 0.1, 0.1],
              markerColor: [0.1, 0.8, 1],
              glowColor: [1, 1, 1]
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
