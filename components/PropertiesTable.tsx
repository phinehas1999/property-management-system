"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

// ---------- Sample Data ----------
const initialData: PropertyRow[] = [
  {
    id: "prop_1",
    name: "Sunset Apartments - Unit A1",
    address: "Bole, Addis Ababa",
    rent_amount: 316,
    status: "available",
    tenant_name: "Phinehas Abdu",
    notes: "Recently renovated kitchen.",
    created_at: "2024-12-01",
    updated_at: "2024-12-01",
  },
  {
    id: "prop_2",
    name: "Riverside Condo - 3B",
    address: "Mekanisa, Addis Ababa",
    rent_amount: 874,
    status: "occupied",
    tenant_name: "Benjamin Abdu",
    notes: "Requested maintenance in bathroom last month.",
    created_at: "2024-07-30",
    updated_at: "2024-08-02",
  },
  {
    id: "prop_3",
    name: "Greenview House",
    address: "Mexico, Addis Ababa",
    rent_amount: 721,
    status: "under_maintenance",
    tenant_name: "Kaleb Abdu",
    notes: "Currently under renovation, tenant temporarily relocated.",
    created_at: "2023-10-30",
    updated_at: "2023-11-15",
  },
];

// ---------- Types ----------
export type PropertyRow = {
  id: string;
  name: string;
  address: string;
  rent_amount: number;
  status: "available" | "occupied" | "under_maintenance";
  tenant_name?: string;
  notes?: string;
  created_at: string; // YYYY-MM-DD
  updated_at: string; // YYYY-MM-DD
};

// ---------- Helper Component (Hydration-safe date) ----------
function SafeDate({ date }: { date: string }) {
  const [formatted, setFormatted] = React.useState(date);
  React.useEffect(() => {
    try {
      setFormatted(new Date(date).toLocaleDateString());
    } catch (e) {
      setFormatted(date);
    }
  }, [date]);
  return <span>{formatted}</span>;
}

// ---------- Columns ----------
export const columns: ColumnDef<PropertyRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Property Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-xs">{row.getValue("address")}</div>
    ),
  },
  {
    accessorKey: "rent_amount",
    header: () => <div className="text-right">Rent Amount</div>,
    cell: ({ row }) => {
      const rent = Number(row.getValue("rent_amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(rent);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, string> = {
        available: "bg-green-500/10 text-green-600 dark:text-green-400",
        occupied: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        under_maintenance:
          "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      };
      return (
        <Badge
          className={variants[status] || "bg-muted text-muted-foreground"}
          variant="secondary"
        >
          {status.replaceAll("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tenant_name",
    header: "Tenant Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("tenant_name") || "—"}</div>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{row.getValue("notes")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => <SafeDate date={row.getValue("created_at")} />,
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }) => <SafeDate date={row.getValue("updated_at")} />,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.id)}
            >
              Copy Property ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => alert(JSON.stringify(item, null, 2))}
            >
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// ---------- Main Table ----------
export function PropertiesTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [tableData, setTableData] = React.useState<PropertyRow[]>(initialData);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return String(value)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Search properties or tenant..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />

        {/* Add Property Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] p-6 flex flex-col overflow-auto">
            <DialogHeader>
              <DialogTitle>Add a New Property</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const id = "prop_" + Math.random().toString(36).slice(2, 9);
                const newItem: PropertyRow = {
                  id,
                  name: (formData.get("name") as string) || "Untitled",
                  address: (formData.get("address") as string) || "",
                  rent_amount: Number(formData.get("rent_amount") || 0),
                  status:
                    (formData.get("status") as
                      | "available"
                      | "occupied"
                      | "under_maintenance") || "available",
                  tenant_name: (formData.get("tenant_name") as string) || "",
                  notes: (formData.get("notes") as string) || "",
                  created_at: new Date().toISOString().split("T")[0],
                  updated_at: new Date().toISOString().split("T")[0],
                };
                setTableData((prev) => [newItem, ...prev]);
                (e.target as HTMLFormElement).reset();
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="name">Property Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="rent_amount">Monthly Rent</Label>
                <Input
                  id="rent_amount"
                  name="rent_amount"
                  type="number"
                  min="0"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="border rounded-md p-2 bg-background text-foreground"
                  required
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="tenant_name">Tenant Name (optional)</Label>
                <Input id="tenant_name" name="tenant_name" />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" />
              </div>

              <DialogFooter className="mt-2">
                <Button type="submit">Add Property</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Selected */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              const selectedIds = new Set(
                table
                  .getFilteredSelectedRowModel()
                  .rows.map((r) => r.original.id)
              );
              setTableData((prev) =>
                prev.filter((t) => !selectedIds.has(t.id))
              );
              table.resetRowSelection();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
