"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
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
const data: TableProps[] = [
  {
    id: "m5gr84i9",
    rent: 316,
    status: "active",
    fullName: "Chala Kebede",
    phone: "+2519123123",
    email: "ken99@example.com",
    moveIn: "2024-01-12",
    moveOut: "2025-01-12",
    createdAt: "2024-12-01",
    notes: "Pays rent early, reliable tenant.",
  },
  {
    id: "3u1reuv4",
    rent: 242,
    status: "vacant",
    fullName: "Phinehas Abdu",
    phone: "+251912234",
    email: "Abe45@example.com",
    moveIn: "2023-05-14",
    moveOut: "2024-05-13",
    createdAt: "2023-05-01",
    notes: "Moved out last month, left apartment in great condition.",
  },
  {
    id: "derv1ws0",
    rent: 837,
    status: "vacant",
    fullName: "Kaleb Abdu",
    phone: "+2519123423",
    email: "Monserrat44@example.com",
    moveIn: "2024-02-10",
    moveOut: "2024-09-15",
    createdAt: "2024-01-25",
    notes: "Considering renewing lease next quarter.",
  },
  {
    id: "5kma53ae",
    rent: 874,
    status: "active",
    fullName: "Benjamin Abdu",
    phone: "+25192342345",
    email: "Silas22@example.com",
    moveIn: "2024-08-02",
    moveOut: "2025-08-01",
    createdAt: "2024-07-30",
    notes: "Requested maintenance in bathroom last month.",
  },
  {
    id: "bhqecj4p",
    rent: 721,
    status: "under maintainance",
    fullName: "Abebe Kebede",
    phone: "+251923452",
    email: "carmella@example.com",
    moveIn: "2023-11-15",
    moveOut: "2024-11-14",
    createdAt: "2023-10-30",
    notes: "Currently under renovation, tenant temporarily relocated.",
  },
  {
    id: "bhqecj4p",
    rent: 721,
    status: "under maintainance",
    fullName: "Abebe Kebede",
    phone: "+251923452",
    email: "carmella@example.com",
    moveIn: "2023-11-15",
    moveOut: "2024-11-14",
    createdAt: "2023-10-30",
    notes: "Currently under renovation, tenant temporarily relocated.",
  },
];

// ---------- Types ----------
export type TableProps = {
  id: string;
  rent: number;
  status: "active" | "vacant" | "under maintainance";
  fullName: string;
  phone: string;
  email: string;
  moveIn: string;
  moveOut: string;
  createdAt: string;
  notes: string;
};

// ---------- Helper Component (Hydration-safe date) ----------
function SafeDate({ date }: { date: string }) {
  // Avoids SSR mismatches by rendering ISO first, then client updates.
  const [formatted, setFormatted] = React.useState(date);
  React.useEffect(() => {
    setFormatted(new Date(date).toLocaleDateString());
  }, [date]);
  return <span>{formatted}</span>;
}

// ---------- Columns ----------
export const columns: ColumnDef<TableProps>[] = [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, string> = {
        active: "bg-green-500/10 text-green-600 dark:text-green-400",
        vacant: "bg-red-500/10 text-red-600 dark:text-red-400",
        "under maintainance":
          "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      };

      return (
        <Badge
          className={variants[status] || "bg-muted text-muted-foreground"}
          variant="secondary"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("fullName")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "rent",
    header: () => <div className="text-right">Monthly Rent</div>,
    cell: ({ row }) => {
      const rent = parseFloat(row.getValue("rent"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(rent);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "moveIn",
    header: "Move In",
    cell: ({ row }) => <SafeDate date={row.getValue("moveIn")} />,
  },
  {
    accessorKey: "moveOut",
    header: "Move Out",
    cell: ({ row }) => <SafeDate date={row.getValue("moveOut")} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <SafeDate date={row.getValue("createdAt")} />,
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
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const tenant = row.original;
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
              onClick={() => navigator.clipboard.writeText(tenant.id)}
            >
              Copy Tenant ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// ---------- Main Table ----------
export function TenantsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [tableData, setTableData] = React.useState(data);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return String(value).toLowerCase().includes(filterValue.toLowerCase());
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
          placeholder="Search tenants..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />

        {/* Add Tenant Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] p-6 flex flex-col overflow-auto">
            <DialogHeader>
              <DialogTitle>Add a New Tenant</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newTenant = {
                  id: Math.random().toString(36).slice(2),
                  fullName: formData.get("fullName") as string,
                  phone: formData.get("phone") as string,
                  email: formData.get("email") as string,
                  rent: Number(formData.get("rent")),
                  status: formData.get("status") as
                    | "active"
                    | "vacant"
                    | "under maintainance",
                  moveIn: formData.get("moveIn") as string,
                  moveOut: formData.get("moveOut") as string,
                  createdAt: new Date().toISOString().split("T")[0],
                  notes: formData.get("notes") as string,
                };
                setTableData((prev) => [...prev, newTenant]);
                (e.target as HTMLFormElement).reset();
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="rent">Monthly Rent</Label>
                <Input id="rent" name="rent" type="number" min="0" required />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="border rounded-md p-2 bg-background text-foreground"
                  required
                >
                  <option value="active">Active</option>
                  <option value="vacant">Vacant</option>
                  <option value="under maintainance">Under Maintenance</option>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="moveIn">Move In</Label>
                <Input id="moveIn" name="moveIn" type="date" required />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="moveOut">Move Out</Label>
                <Input id="moveOut" name="moveOut" type="date" required />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" />
              </div>

              <DialogFooter className="mt-2">
                <Button type="submit">Add Tenant</Button>
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
