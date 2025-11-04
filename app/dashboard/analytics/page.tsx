import { ChartAreaPayments } from "@/components/chart-area-interactive";
import { ProfitChart } from "@/components/ui/AnalyticsChartLine";
import { AnalyticsPieChart } from "@/components/ui/AnalyticsPieChart";
import { AnalyticsRadarChart } from "@/components/ui/AnalyticsRadarChart";

export default function Page() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Full width line chart */}
      <div className="w-full">
        <ProfitChart />
      </div>

      {/* Narrow charts side by side on larger screens */}
      <div className="w-full  mx-auto md:mx-0">
        <AnalyticsPieChart />
      </div>

      {/* Full width chart area properties */}
      <div className="w-full">
        <ChartAreaPayments />
      </div>
    </div>
  );
}
