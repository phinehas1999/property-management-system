import { ChartAreaPayments } from "@/components/chart-area-interactive";
import { MaintenanceTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaPayments />
      </div>
      <div className="px-4 lg:px-6">
        <MaintenanceTable />
      </div>
    </>
  );
}
