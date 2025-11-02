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
import {
  ChevronDown,
  MoreHorizontal,
  Info,
  Trash2,
  Plus,
  Edit2,
  ChevronsUpDown,
  Check,
} from "lucide-react";

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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ApiRaw = Record<string, any>;

export type PropertyRow = {
  id: number;
  name: string;
  address: string;
  rentAmount: number;
  status: "available" | "occupied" | "under_maintenance";
  tenantName?: string | null;
  tenantId?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: "paid" | "unpaid";
};

export type TenantRow = {
  id: number;
  fullName: string;
};

// ---------- Helpers ----------
function SafeDate({ date }: { date: string }) {
  const [formatted, setFormatted] = React.useState(date);
  React.useEffect(() => {
    try {
      setFormatted(new Date(date).toLocaleDateString());
    } catch {
      setFormatted(date);
    }
  }, [date]);
  return <span>{formatted}</span>;
}

function normalizeProperty(
  raw: ApiRaw,
  tenantsList?: TenantRow[]
): PropertyRow {
  const id = raw.id ?? raw.ID ?? 0;
  const name = raw.name ?? raw.title ?? "";
  const address = raw.address ?? raw.addr ?? "";
  const rentAmount =
    Number(raw.rentAmount ?? raw.rent_amount ?? raw.rent ?? 0) || 0;
  const status = (raw.status ?? raw.state ?? "available") as
    | "available"
    | "occupied"
    | "under_maintenance";
  const tenantId = raw.tenantId ?? raw.tenant_id ?? null;

  const tenantName = Array.isArray(tenantsList)
    ? (tenantsList.find((t) => t.id === tenantId)?.fullName ?? "")
    : (raw.tenantName ?? raw.tenant_name ?? raw.tenant ?? "");

  const notes = raw.notes ?? raw.note ?? "";
  const createdAt = raw.createdAt ?? raw.created_at ?? raw.created ?? "";
  const updatedAt = raw.updatedAt ?? raw.updated_at ?? raw.updated ?? "";
  const paymentStatus = raw.paymentStatus ?? raw.payment_status ?? "unpaid";

  return {
    id,
    name,
    address,
    rentAmount,
    status,
    tenantName,
    tenantId,
    notes,
    createdAt,
    updatedAt,
    paymentStatus,
  };
}

// ---------- Main Component ----------
export function PropertiesTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [tableData, setTableData] = React.useState<PropertyRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PropertyRow | null>(
    null
  );

  // Tenant selection
  const [tenantsList, setTenantsList] = React.useState<TenantRow[]>([]);
  const [selectedTenant, setSelectedTenant] = React.useState<string | null>(
    null
  );
  const [selectedTenantEdit, setSelectedTenantEdit] = React.useState<
    string | null
  >(null);

  const [month, setMonth] = React.useState(format(new Date(), "yyyy-MM"));

  // ---------- Fetch properties ----------
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/properties_?month=${month}`);
        const raw = await res.json();
        if (!mounted) return;
        if (Array.isArray(raw)) {
          setTableData(raw.map((r) => normalizeProperty(r, tenantsList)));
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tenantsList, month]); // ✅ depend on tenantsList

  // ---------- Fetch tenants ----------
  React.useEffect(() => {
    fetch("/api/tenants")
      .then((res) => res.json())
      .then(setTenantsList)
      .catch(() => setTenantsList([]));
  }, []);

  // ---------- Listen for edit events ----------
  React.useEffect(() => {
    function onEdit(e: Event) {
      const ev = e as CustomEvent;
      const id = ev?.detail?.id;
      if (!id) return;
      const row = tableData.find((r) => r.id === Number(id));
      if (row) {
        setEditingItem(row);
        setSelectedTenantEdit(row.tenantId ? String(row.tenantId) : null);
        setIsEditOpen(true);
      }
    }
    window.addEventListener("properties:edit", onEdit as EventListener);
    return () =>
      window.removeEventListener("properties:edit", onEdit as EventListener);
  }, [tableData]);

  // ---------- Columns ----------
  const columns: ColumnDef<PropertyRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          // Checkbox will be checked if all rows are selected
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate") // This line is still incorrect for the component
          }
          // Instead, use the onChange handler to toggle all rows
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
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
        <div className="text-sm truncate max-w-xs">
          {row.getValue("address")}
        </div>
      ),
    },
    {
      accessorKey: "rentAmount",
      header: () => <div className="text-right">Rent Amount</div>,
      cell: ({ row }) => {
        const rent = Number(row.getValue("rentAmount"));
        const formatted = new Intl.NumberFormat("en-ET", {
          style: "currency",
          currency: "ETB",
        }).format(rent);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;
        return (
          <Badge
            className={
              status === "paid"
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }
          >
            {status === "paid" ? "Paid" : "Unpaid"}
          </Badge>
        );
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
      accessorKey: "tenantName",
      header: "Tenant Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("tenantName") || "—"}</div>
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
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <SafeDate date={row.getValue("createdAt")} />,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => <SafeDate date={row.getValue("updatedAt")} />,
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(item.id.toString())
                }
              >
                Copy Property ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("properties:edit", {
                      detail: { id: item.id },
                    })
                  );
                }}
              >
                <div className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4" /> Edit
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => alert(JSON.stringify(item, null, 2))}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  recordPaymentForTenant(item.tenantId ?? null, item.rentAmount)
                }
              >
                Record Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, globalFilter, columnVisibility, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  function buildPayloadFromForm(fd: FormData) {
    return {
      name: String(fd.get("name") ?? ""),
      address: String(fd.get("address") ?? ""),
      rentAmount: Number(fd.get("rent_amount") ?? 0),
      status: String(fd.get("status") ?? "available"),
      tenantId: fd.get("tenant_id") ? Number(fd.get("tenant_id")) : null,
      notes: String(fd.get("notes") ?? ""),
      // snake_case for backend
      tenant_id: fd.get("tenant_id") ? Number(fd.get("tenant_id")) : null,
      rent_amount: Number(fd.get("rent_amount") ?? 0),
    };
  }
  async function recordPaymentForTenant(
    tenantId: number | null,
    amount: number
  ) {
    if (!tenantId) {
      console.error("No tenantId provided");
      return;
    }

    try {
      // Post payment for the selected month (use first day of month)
      const datePaid = `${month}-01`; // 'YYYY-MM-01' - matches your backend date_trunc logic
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, amount, datePaid }),
      });

      if (!res.ok) {
        console.error("Failed to record payment", await res.text());
        return;
      }

      // Option A (safer): re-fetch the whole properties list for the current month.
      // That ensures paymentStatus and tenantName come from the backend logic.
      const pRes = await fetch(`/api/properties_?month=${month}`);
      const raw = await pRes.json();
      if (Array.isArray(raw)) {
        setTableData(raw.map((r) => normalizeProperty(r, tenantsList)));
      } else {
        // fallback: try partial in-memory update to mark tenant as paid
        setTableData((prev) =>
          prev.map((row) =>
            row.tenantId === tenantId ? { ...row, paymentStatus: "paid" } : row
          )
        );
      }
    } catch (err) {
      console.error("Error recording payment:", err);
    }
  }

  async function handleAddProperty(formData: FormData) {
    const payload = buildPayloadFromForm(formData);

    try {
      // Include ?month=… so backend computes payment status for selected month
      const res = await fetch(`/api/properties_?month=${month}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to add property");
        return;
      }

      const raw = await res.json();
      const newItem = normalizeProperty(raw, tenantsList);

      // ✅ Prepend the new property to the table immediately
      setTableData((prev) => [newItem, ...prev]);

      // Optional cleanup
      setSelectedTenant(null);
    } catch (err) {
      console.error("Failed to add property:", err);
    }
  }

  async function handleDeleteSelected() {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (!selectedRows.length) return;
    try {
      await Promise.all(
        selectedRows.map((row) =>
          fetch(`/api/properties_/${row.original.id}`, { method: "DELETE" })
        )
      );
      const ids = new Set(selectedRows.map((s) => s.original.id));
      setTableData((prev) => prev.filter((r) => !ids.has(r.id)));
      table.resetRowSelection();
    } catch (err) {
      console.error("Failed to delete selected rows:", err);
    }
  }

  async function handleDeleteSingle(id: number) {
    try {
      const res = await fetch(`/api/properties_/${id}`, { method: "DELETE" });
      if (!res.ok) return console.error("Delete failed:", await res.text());
      setTableData((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingItem) return;

    const fd = new FormData(e.currentTarget);
    const payload = buildPayloadFromForm(fd);

    const tenantId = payload.tenantId ?? null;
    const tenantName =
      tenantsList.find((t) => t.id === tenantId)?.fullName ?? "";

    try {
      const res = await fetch(`/api/properties_/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.json().catch(() => null);

      const updated: PropertyRow = {
        ...editingItem, // base previous values
        ...payload, // updated fields from form
        tenantName:
          tenantsList.find((t) => t.id === payload.tenantId)?.fullName ?? null,
        status: payload.status as
          | "available"
          | "occupied"
          | "under_maintenance",
      };

      setTableData((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );

      setIsEditOpen(false);
      setEditingItem(null);
      setSelectedTenantEdit(updated.tenantId ? String(updated.tenantId) : null);
    } catch (err) {
      console.error("Failed to edit property:", err);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Search properties or tenant..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />

        {/* 🗓️ Month Picker */}
        <div className="flex items-center gap-2">
          <Label htmlFor="month" className="text-sm text-muted-foreground">
            Month
          </Label>
          <Input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-[150px]"
          />
        </div>

        {/* Add Property Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg p-6">
            <DialogHeader>
              <DialogTitle>Add a New Property</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                await handleAddProperty(formData);
                if (form) form.reset(); // ✅ safe reset
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <Label htmlFor="name">Property Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>
              <div>
                <Label htmlFor="rent_amount">Monthly Rent</Label>
                <Input
                  id="rent_amount"
                  name="rent_amount"
                  type="number"
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="border rounded-md p-2 bg-background text-foreground"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
              <div>
                <Label>Assign Tenant (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedTenant
                        ? tenantsList.find(
                            (t) => t.id === Number(selectedTenant)
                          )?.fullName
                        : "Select tenant"}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search tenant..." />
                      <CommandEmpty>No tenants found.</CommandEmpty>
                      <CommandGroup>
                        {tenantsList.map((t) => (
                          <CommandItem
                            key={t.id}
                            value={t.fullName}
                            onSelect={() => setSelectedTenant(String(t.id))}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTenant === String(t.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {t.fullName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <input
                  type="hidden"
                  name="tenant_id"
                  value={selectedTenant ?? ""}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" />
              </div>
              <DialogFooter>
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
            onClick={handleDeleteSelected}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {/* Column toggle */}
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

      <p className="text-sm text-muted-foreground mb-2">
        Showing payment status for <strong>{month}</strong>
      </p>
      <div className="overflow-hidden rounded-md border">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading properties...
          </div>
        ) : (
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
        )}
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

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(v) => {
          if (!v) {
            setEditingItem(null);
            setSelectedTenantEdit(null);
          }
          setIsEditOpen(v);
        }}
      >
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          {editingItem ? (
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="edit_name">Property Name</Label>
                <Input
                  id="edit_name"
                  name="name"
                  defaultValue={editingItem.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  name="address"
                  defaultValue={editingItem.address}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_rent_amount">Monthly Rent</Label>
                <Input
                  id="edit_rent_amount"
                  name="rent_amount"
                  type="number"
                  defaultValue={editingItem.rentAmount}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <select
                  id="edit_status"
                  name="status"
                  defaultValue={editingItem.status}
                  className="border rounded-md p-2 bg-background text-foreground"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
              <div>
                <Label>Tenant (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedTenantEdit
                        ? tenantsList.find(
                            (t) => t.id === Number(selectedTenantEdit)
                          )?.fullName
                        : "Select tenant"}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search tenant..." />
                      <CommandEmpty>No tenants found.</CommandEmpty>
                      <CommandGroup>
                        {tenantsList.map((t) => (
                          <CommandItem
                            key={t.id}
                            value={t.fullName}
                            onSelect={() => setSelectedTenantEdit(String(t.id))}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTenantEdit === String(t.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {t.fullName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <input
                  type="hidden"
                  name="tenant_id"
                  value={selectedTenantEdit ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="edit_notes">Notes</Label>
                <Input
                  id="edit_notes"
                  name="notes"
                  defaultValue={editingItem.notes ?? ""}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingItem(null);
                    setSelectedTenantEdit(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    handleDeleteSingle(editingItem.id);
                    setIsEditOpen(false);
                  }}
                >
                  Delete
                </Button>
              </div>
            </form>
          ) : (
            <div>Loading...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
