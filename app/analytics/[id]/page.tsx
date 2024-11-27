"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
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
import { TrendingUp, Globe, Link2 } from "lucide-react";

interface CobePreparedState {
  width: number;
  height: number;
  phi: number;
  theta: number;
  dark: number;
  diffuse: number;
  mapSamples: number;
  mapBrightness: number;
  baseColor: number[];
  markerColor: number[];
  glowColor: number[];
  [key: string]: any;
}

interface AnalyticsData {
  labels: string[];
  data: number[];
  totalClicks: number;
  growth: number;
  topCountries: [string, number][];
  topReferrers: [string, number][];
  browserBreakdown: Record<string, number>;
  globeMarkers: GlobeMarker[];
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [globeMarkers, setGlobeMarkers] = useState<GlobeMarker[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(
        document.documentElement.classList.contains("dark")
      );
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (session && params.id) {
      fetchAnalytics();
    }
  }, [session, params.id, timeRange]);

  useEffect(() => {
    if (analyticsData && canvasRef.current) {
      let phi = 0;

      const globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: 700,
        height: 700,
        phi: 0,
        theta: 0,
        dark: isDarkMode ? 1 : 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: isDarkMode ? [0.1, 0.1, 0.1] : [0.9, 0.9, 0.9],
        markerColor: [0.1, 0.8, 1],
        glowColor: isDarkMode ? [0.2, 0.2, 0.2] : [1, 1, 1],
        markers: globeMarkers.map(marker => ({
          location: marker.location,
          size: marker.size
        })),
        onRender: (state: Record<string, any>) => {
          const preparedState = state as CobePreparedState;
          preparedState.phi = phi;
          phi += 0.005;
        }
      });

      return () => {
        globe.destroy();
      };
    }
  }, [globeMarkers, isDarkMode]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/analytics?urlId=${params.id}&range=${timeRange}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        setGlobeMarkers(data.globeMarkers);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  if (!analyticsData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-300">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
        <h1 className="text-2xl font-bold text-foreground dark:text-white md:text-3xl">
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
            <Globe className="text-green-500" />
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-lg dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 text-indigo-500" />
              Browser Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(analyticsData.browserBreakdown || {})
              .sort((a, b) => b[1] - a[1])
              .map(([browser, count]) => (
                <div
                  key={browser}
                  className="flex items-center justify-between border-b border-gray-200 py-2 last:border-b-0 dark:border-gray-700">
                  <span className="capitalize text-primary dark:text-white">
                    {browser}
                  </span>
                  <div className="flex items-center">
                    <span className="mr-2 font-medium text-primary dark:text-gray-300">
                      {count}
                    </span>
                    <div
                      className="h-2 rounded-full bg-indigo-500 dark:bg-indigo-600"
                      style={{
                        width: `${(count / analyticsData.totalClicks) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-lg dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 text-green-500" />
              Global Reach
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex items-center justify-center">
            <div className="aspect-square w-full max-w-[500px]">
              <canvas
                ref={canvasRef}
                className="size-[500px] md:size-[600px] mx-auto h-full w-full object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
