"use client";

import * as React from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// ---------------------- Types ----------------------
type Status = "Pending" | "In Progress" | "Done";

interface MaintenanceTask {
  id: number;
  task: string;
  type: string;
  status: Status;
  dueDate: string;
  assignedTo: string;
}

// ---------------------- Sample Data ----------------------
const initialTasks: MaintenanceTask[] = [
  {
    id: 1,
    task: "Fix leaking pipe – Unit 2B",
    type: "Plumbing",
    status: "In Progress",
    dueDate: "2025-10-28",
    assignedTo: "John D.",
  },
  {
    id: 2,
    task: "Paint hallway walls – Building A",
    type: "Renovation",
    status: "Pending",
    dueDate: "2025-10-30",
    assignedTo: "Maria L.",
  },
  {
    id: 3,
    task: "Inspect fire alarms – Building C",
    type: "Inspection",
    status: "Done",
    dueDate: "2025-10-24",
    assignedTo: "Daniel K.",
  },
  {
    id: 4,
    task: "Replace broken window – Unit 1A",
    type: "Repair",
    status: "Pending",
    dueDate: "2025-10-29",
    assignedTo: "Alex R.",
  },
];

const statusColors: Record<Status, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
};

// ---------------------- Component ----------------------
export function MaintenanceTable() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    type: "",
    status: "Pending" as Status,
    dueDate: "",
    assignedTo: "",
  });

  const handleAddTask = () => {
    if (!newTask.task.trim()) return alert("Please enter a task name.");

    const taskToAdd: MaintenanceTask = {
      ...newTask,
      id: tasks.length + 1,
    };

    setTasks((prev) => [...prev, taskToAdd]);
    setNewTask({
      task: "",
      type: "",
      status: "Pending",
      dueDate: "",
      assignedTo: "",
    });
    setOpen(false);
  };

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

          {/* Dialog for Adding a Task */}
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
                    setNewTask((prev) => ({ ...prev, task: e.target.value }))
                  }
                />

                <Input
                  placeholder="Type (e.g., Plumbing, Repair)"
                  value={newTask.type}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, type: e.target.value }))
                  }
                />

                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />

                <Input
                  placeholder="Assigned to"
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }))
                  }
                />

                <Select
                  value={newTask.status}
                  onValueChange={(val: Status) =>
                    setNewTask((prev) => ({ ...prev, status: val }))
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.task}</TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>
                  <Badge className={statusColors[task.status]}>
                    {task.status}
                  </Badge>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
