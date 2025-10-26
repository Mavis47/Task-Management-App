"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ArrowUpDown, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Document {
  id: number;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string; 
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: number;
  assignedBy: number;
  documents: Document[]; // NEW
  user: {
    id: number;
    email: string;
    role: string;
  };
  assigner?: {
    id: number;
    email: string;
    role: string;
  };
}

export default function UserPanel() {
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).token
    : null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortField, setSortField] = useState<keyof Task>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const [loading, setLoading] = useState(false);

  // Modal & editing states
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);

  const { logout } = useAuth();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/task/getAllTask", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err: any) {
      console.error("Error fetching tasks:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Filtering
  const filteredData = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    return tasks.filter((task) => {
      const title = task.title?.toLowerCase() || "";
      const userEmail = task.user?.email?.toLowerCase() || "";
      const assignerEmail = task.assigner?.email?.toLowerCase() || "";
      return (
        title.includes(lowerFilter) ||
        userEmail.includes(lowerFilter) ||
        assignerEmail.includes(lowerFilter)
      );
    });
  }, [filter, tasks]);

  // Sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aField: any = a[sortField];
      let bField: any = b[sortField];

      if (sortField === "assigner") {
        aField = a.assigner?.email || "";
        bField = b.assigner?.email || "";
      }

      if (sortField === "user") {
        aField = a.user.email;
        bField = b.user.email;
      }

      if (aField < bField) return sortOrder === "asc" ? -1 : 1;
      if (aField > bField) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const toggleSort = (field: keyof Task) => {
    if (field === sortField) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Delete
  const handleDelete = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/task/deleteTask/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchTasks();
    } catch (err: any) {
      console.error("Error deleting task:", err.response?.data || err.message);
    }
  };

  // Open edit modal
  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
  };

  // Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("priority", priority);
      formData.append("dueDate", dueDate);

      files.forEach((file) => formData.append("documents", file));

      await axios.patch(
        `http://localhost:5000/api/task/updateTask/${editingTaskId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchTasks();
      setEditingTaskId(null);
      setFiles([]);
    } catch (err: any) {
      console.error("Error updating task:", err.response?.data || err.message);
    }
  };

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("priority", priority);
      formData.append("dueDate", dueDate);

      files.forEach((file) => formData.append("documents", file));

      await axios.post("http://localhost:5000/api/task/createTask", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchTasks();
      setIsAddOpen(false);
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("medium");
      setDueDate("");
      setFiles([]);
    } catch (err: any) {
      console.error("Error creating task:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 p-6">
      <Card className="flex-1 rounded-r-2xl shadow-lg ml-4 p-4">
        <CardHeader className="flex flex-col gap-4 items-center">
          <CardTitle className="text-2xl font-semibold">My Tasks</CardTitle>

          {/* Add Task Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription asChild>
                  <form
                    onSubmit={handleCreate}
                    className="flex flex-col gap-3 mt-2"
                  >
                    <Input
                      placeholder="Enter Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Enter Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />

                    <label className="mt-2">Attach Documents (max 5)</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (!e.target.files) return;
                        setFiles(Array.from(e.target.files).slice(0, 5)); // limit to 5 files
                      }}
                    />

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Submit</Button>
                    </div>
                  </form>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search by title or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-600">
              Loading tasks...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => toggleSort("title")}
                      className="cursor-pointer"
                    >
                      Title <ArrowUpDown className="inline w-4 h-4" />
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead
                      onClick={() => toggleSort("status")}
                      className="cursor-pointer"
                    >
                      Status <ArrowUpDown className="inline w-4 h-4" />
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("priority")}
                      className="cursor-pointer"
                    >
                      Priority <ArrowUpDown className="inline w-4 h-4" />
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("assigner")}
                      className="cursor-pointer"
                    >
                      Assigned By <ArrowUpDown className="inline w-4 h-4" />
                    </TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Documents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>{task.assigner?.email || "Unknown"}</TableCell>

                      <TableCell className="flex gap-2">
                        {/* Edit */}
                        <Dialog open={editingTaskId === task.id}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(task)}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Task</DialogTitle>
                              <DialogDescription asChild>
                                <form
                                  onSubmit={handleUpdate}
                                  className="flex flex-col gap-3 mt-2"
                                >
                                  <Input
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                  />
                                  <Input
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) =>
                                      setDescription(e.target.value)
                                    }
                                  />
                                  <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="border rounded p-2 w-full"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">
                                      In Progress
                                    </option>
                                    <option value="completed">Completed</option>
                                  </select>
                                  <select
                                    value={priority}
                                    onChange={(e) =>
                                      setPriority(e.target.value)
                                    }
                                    className="border rounded p-2 w-full"
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                  </select>
                                  <label className="mt-2">
                                    Attach Documents (max 5)
                                  </label>
                                  <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                      if (!e.target.files) return;
                                      setFiles(
                                        Array.from(e.target.files).slice(0, 5)
                                      );
                                    }}
                                  />

                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                      variant="outline"
                                      type="button"
                                      onClick={() => setEditingTaskId(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button type="submit">Save</Button>
                                  </div>
                                </form>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </TableCell>
                      <TableCell>
                        {task.documents && task.documents.length > 0 ? (
                          <ul className="space-y-1">
                            {task.documents.map((doc) => (
                              <li key={doc.id}>
                                <a
                                  href={`http://localhost:5000${doc.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  {doc.originalName}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">No documents</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-center items-center mt-6 gap-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <button onClick={handleLogout}>Logout</button>
      </Card>
    </div>
  );
}
