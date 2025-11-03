"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Status = "Pending" | "In Progress" | "Done";

interface MaintenanceTask {
  id: number;
  task: string;
  type: string;
  status: Status;
  dueDate: string;
  assignedTo: string;
}

const statusColors: Record<Status, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
};

export function MaintenanceTable() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState({
    task: "",
    type: "",
    status: "Pending" as Status,
    dueDate: "",
    assignedTo: "",
  });

  // Fetch tasks
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/maintenance");
      const data = await res.json();
      setTasks(data);
      setLoading(false);
    })();
  }, []);

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  // Add new task
  const handleAddTask = async () => {
    if (!newTask.task.trim()) return alert("Please enter a task name.");

    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    const data = await res.json();
    setTasks((prev) => [...prev, data]);
    setOpen(false);
    setNewTask({
      task: "",
      type: "",
      status: "Pending",
      dueDate: "",
      assignedTo: "",
    });
  };

  // Delete task
  const handleDelete = async (id: number) => {
    await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Change status
  const handleStatusChange = async (id: number, status: Status) => {
    await fetch(`/api/maintenance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  if (loading)
    return (
      <div className="p-6 text-center text-muted-foreground">Loading...</div>
    );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Maintenance Tasks</CardTitle>
          <CardDescription>
            Track ongoing property maintenance and repairs
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Select onValueChange={setFilter} defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                + Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new maintenance task.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3 py-2">
                <Input
                  placeholder="Task title"
                  value={newTask.task}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, task: e.target.value }))
                  }
                />
                <Input
                  placeholder="Type (e.g., Plumbing, Repair)"
                  value={newTask.type}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, type: e.target.value }))
                  }
                />
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
                <Input
                  placeholder="Assigned to"
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, assignedTo: e.target.value }))
                  }
                />
                <Select
                  value={newTask.status}
                  onValueChange={(val: Status) =>
                    setNewTask((p) => ({ ...p, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.task}</TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(val: Status) =>
                      handleStatusChange(task.id, val)
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
