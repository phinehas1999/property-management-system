"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Tenant = {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  rent: number;
  status: string;
  moveIn: string;
  moveOut: string;
  createdAt: string;
  notes: string | null;
};

// ✅ Helper to format date safely
function SafeDate({ date }: { date: string | undefined }) {
  const [formatted, setFormatted] = React.useState(date ?? "");
  React.useEffect(() => {
    try {
      setFormatted(date ? new Date(date).toLocaleDateString() : "");
    } catch (e) {
      setFormatted(date ?? "");
    }
  }, [date]);
  return <span>{formatted}</span>;
}

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
  const [tableData, setTableData] = React.useState<Tenant[]>([]);

  // For dialogs
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editTenant, setEditTenant] = React.useState<Tenant | null>(null);

  // ✅ Load tenants from DB
  React.useEffect(() => {
    let mounted = true;
    fetch("/api/tenants")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setTableData(data);
      })
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, []);

  // Columns (defined inside component because they reference edit handler)
  const columns = React.useMemo<ColumnDef<Tenant>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const isIndeterminate =
            table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();

          return (
            <Checkbox
              checked={
                table.getIsAllRowsSelected()
                  ? true
                  : isIndeterminate
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
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
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "rent",
        header: () => <div className="text-right">Monthly Rent</div>,
        cell: ({ row }) => {
          const rent = Number(row.getValue("rent"));
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
        cell: ({ row }) => {
          const tenant = row.original;
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
                    navigator.clipboard.writeText(tenant.id.toString())
                  }
                >
                  Copy Tenant ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditTenant(tenant)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    // delete without reloading — optimistic update
                    const res = await fetch(`/api/tenants/${tenant.id}`, {
                      method: "DELETE",
                    });
                    if (res.ok) {
                      setTableData((prev) =>
                        prev.filter((t) => t.id !== tenant.id)
                      );
                    } else {
                      console.error("Failed to delete tenant");
                    }
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      {/* Header with search + add */}
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Search tenants..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />

        {/* Add Tenant Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tenant</DialogTitle>
            </DialogHeader>

            <AddTenantForm
              onAdded={(newTenant) => {
                // server returns created tenant
                setTableData((prev) => [newTenant, ...prev]);
                setIsAddOpen(false);
              }}
              onCancel={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Bulk Delete */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="icon"
            onClick={async () => {
              const ids = table
                .getFilteredSelectedRowModel()
                .rows.map((r) => r.original.id);

              const responses = await Promise.all(
                ids.map((id) =>
                  fetch(`/api/tenants/${id}`, { method: "DELETE" })
                )
              );

              // remove successful deletes from state
              const succeeded = responses
                .map((r, i) => ({ ok: r.ok, id: ids[i] }))
                .filter((r) => r.ok)
                .map((r) => r.id);

              setTableData((prev) =>
                prev.filter((t) => !succeeded.includes(t.id))
              );
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
              .filter((c) => c.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
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
                <TableCell colSpan={10} className="text-center h-24">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog (controlled) */}
      <Dialog
        open={!!editTenant}
        onOpenChange={(open) => {
          if (!open) setEditTenant(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          {editTenant && (
            <EditTenantForm
              tenant={editTenant}
              onSaved={(updated) => {
                setTableData((prev) =>
                  prev.map((t) => (t.id === updated.id ? updated : t))
                );
                setEditTenant(null);
              }}
              onCancel={() => setEditTenant(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- AddTenantForm ----------------
function AddTenantForm({
  onAdded,
  onCancel,
}: {
  onAdded: (t: Tenant) => void;
  onCancel: () => void;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      rent: Number(fd.get("rent") ?? 0),
      // status input removed — defaulting to 'active'
      status: "active",
      moveIn: String(fd.get("moveIn") ?? ""),
      moveOut: String(fd.get("moveOut") ?? ""),
      notes: String(fd.get("notes") ?? ""),
    };

    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to add tenant");
      return;
    }

    const created = await res.json();
    onAdded(created);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Label htmlFor="fullName">Full Name</Label>
      <Input name="fullName" required />
      <Label htmlFor="email">Email</Label>
      <Input name="email" type="email" required />
      <Label htmlFor="phone">Phone</Label>
      <Input name="phone" required />
      <Label htmlFor="rent">Monthly Rent</Label>
      <Input name="rent" type="number" required />
      {/* status input removed on purpose */}
      <Label htmlFor="moveIn">Move In</Label>
      <Input name="moveIn" type="date" required />
      <Label htmlFor="moveOut">Move Out</Label>
      <Input name="moveOut" type="date" required />
      <Label htmlFor="notes">Notes</Label>
      <Input name="notes" />
      <DialogFooter>
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">Add Tenant</Button>
        </div>
      </DialogFooter>
    </form>
  );
}

// ---------------- EditTenantForm ----------------
function EditTenantForm({
  tenant,
  onSaved,
  onCancel,
}: {
  tenant: Tenant;
  onSaved: (t: Tenant) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = React.useState(tenant.fullName);
  const [email, setEmail] = React.useState(tenant.email);
  const [phone, setPhone] = React.useState(tenant.phone);
  const [rent, setRent] = React.useState(String(tenant.rent));
  const [moveIn, setMoveIn] = React.useState(tenant.moveIn?.slice(0, 10) ?? "");
  const [moveOut, setMoveOut] = React.useState(
    tenant.moveOut?.slice(0, 10) ?? ""
  );
  const [notes, setNotes] = React.useState(tenant.notes ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      rent: Number(rent) || 0,
      // keep status unchanged on edit (no UI to edit it)
      status: tenant.status ?? "active",
      moveIn,
      moveOut,
      notes,
    };

    const res = await fetch(`/api/tenants/${tenant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to update tenant");
      return;
    }

    const updated = await res.json();
    onSaved(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Label>Full Name</Label>
      <Input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Label>Email</Label>
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
      />
      <Label>Phone</Label>
      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <Label>Monthly Rent</Label>
      <Input
        value={rent}
        onChange={(e) => setRent(e.target.value)}
        type="number"
        required
      />

      <Label>Move In</Label>
      <Input
        value={moveIn}
        onChange={(e) => setMoveIn(e.target.value)}
        type="date"
        required
      />
      <Label>Move Out</Label>
      <Input
        value={moveOut}
        onChange={(e) => setMoveOut(e.target.value)}
        type="date"
        required
      />
      <Label>Notes</Label>
      <Input value={notes} onChange={(e) => setNotes(e.target.value)} />

      <DialogFooter>
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </DialogFooter>
    </form>
  );
}
