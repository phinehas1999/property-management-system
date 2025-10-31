import { ChartAreaProperties } from "@/components/chart-area-interactive";
import { MaintenanceTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { TenantsTable } from "@/components/TenantsTable";

export default function Page() {
  return (
    <>
      <div className="px-4 lg:px-6">
        <TenantsTable />
      </div>
    </>
  );
}
