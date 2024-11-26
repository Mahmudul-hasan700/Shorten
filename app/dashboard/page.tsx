import { UrlList } from "@/components/UrlList";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { QrCodeGenerator } from "@/components/QrCodeGenerator";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <UrlList />
      {/*<AnalyticsDashboard />*/}
      <QrCodeGenerator />
    </div>
  );
}
