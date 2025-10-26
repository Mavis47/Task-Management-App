"use client";

import { useState, useEffect, useMemo } from "react";
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
import { ArrowUpDown } from "lucide-react";
import type { User } from "../contexts/auth.context";
import { getAllUsers } from "../../api/userApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Document {
  id: number;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;       
  filepath: string;  
  taskId: number;
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: number;
  user: {
    id: number;
    email: string;
    role: string;
  };
  assigner: {
    id: number;
    email: string;
    role: string;
  };
  documents: Document[];
}

export default function AdminPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortField, setSortField] = useState<keyof Task>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const pageSize = 4;
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).token
    : null;

  // Modal & editing states
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);

  // Fetch tasks & users
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5000/api/task/getAllTask",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTasks(res.data);

        const usersRes = await getAllUsers(token);
        setUsers(usersRes);
      } catch (error: any) {
        console.error(
          "Error fetching tasks:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filtering
  const filteredData = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(filter.toLowerCase()) ||
        task.user.email.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, tasks]);

  // Sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aField: any = a[sortField];
      let bField: any = b[sortField];

      // handle nested user
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

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setAssignedTo(task.assignedTo);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/task/deleteTask/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks((prev) => prev.filter((task) => task.id !== id));
      alert(res.data.message);
    } catch (err: any) {
      console.error(err);
    }
  };

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
      if (assignedTo) formData.append("assignedTo", String(assignedTo));

      files.forEach((file) => formData.append("documents", file));

      const res = await axios.patch(
        `http://localhost:5000/api/task/updateTask/${editingTaskId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title,
                description,
                status,
                priority,
                dueDate,
                assignedTo: assignedTo ?? task.assignedTo,
                user:
                  users.find((u) => u.id === (assignedTo ?? task.assignedTo)) ||
                  task.user,
              }
            : task
        )
      );

      setEditingTaskId(null);
      setFiles([]);
      alert(res.data.message);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("priority", priority);
      formData.append("dueDate", dueDate);
      if (assignedTo) formData.append("assignedTo", String(assignedTo));

      files.forEach((file) => formData.append("documents", file));

      const res = await axios.post(
        "http://localhost:5000/api/task/createTask",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newTask = res.data.task;
      const assignedUser = users.find((u) => u.id === newTask.assignedTo);

      setTasks((prev) => [
        ...prev,
        {
          ...newTask,
          user: assignedUser || { id: 0, email: "Unknown", role: "Unknown" },
        },
      ]);

      // Reset form
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("medium");
      setDueDate("");
      setAssignedTo(null);
      setFiles([]);

      alert(res.data.message);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 p-6">
      {/* Sidebar */}
      <div className="w-1/5 bg-white border-r p-6 flex flex-col justify-between rounded-l-2xl shadow">
        <div>
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u.id} className="text-sm text-gray-700">
                {u.email} — <span className="text-gray-500">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Button variant="ghost" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main Admin Panel */}
      <Card className="flex-1 rounded-r-2xl shadow-lg ml-4 p-4">
        <CardHeader className="flex flex-col gap-4 items-center">
          <CardTitle className="text-2xl font-semibold">Admin Panel</CardTitle>
          <Dialog>
            <DialogTrigger>Assign Task to User</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new Task</DialogTitle>
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
                    <Select
                      value={assignedTo ? String(assignedTo) : ""}
                      onValueChange={(val) => setAssignedTo(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to User" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.email} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label className="mt-2">Attach Documents (max 5)</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (!e.target.files) return;
                        setFiles(Array.from(e.target.files).slice(0, 5)); 
                      }}
                    />

                    <Button type="submit" className="mt-4">
                      Create Task
                    </Button>
                  </form>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Filter by title or user email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
            <Button>
              <a href="/users">Check Users</a>
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-600">
              Loading tasks...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        onClick={() => toggleSort("title")}
                        className="cursor-pointer"
                      >
                        Task Title <ArrowUpDown className="inline w-4 h-4" />
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead
                        onClick={() => toggleSort("user")}
                        className="cursor-pointer"
                      >
                        User Email <ArrowUpDown className="inline w-4 h-4" />
                      </TableHead>
                      <TableHead>Role</TableHead>
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
                        <TableCell>{task.user.email}</TableCell>
                        <TableCell>{task.user.role}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>

                        <TableCell>
                          {task.documents.length > 0 ? (
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
              </div>

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
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog
        open={!!editingTaskId}
        onOpenChange={(open) => !open && setEditingTaskId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription asChild>
              <div>
                <form onSubmit={handleUpdate} className="flex flex-col gap-3">
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <Input
                    type="date"
                    value={dueDate ? dueDate.slice(0, 10) : ""}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <select
                    value={assignedTo || ""}
                    onChange={(e) => setAssignedTo(Number(e.target.value))}
                    className="border rounded p-2 w-full"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} ({u.role})
                      </option>
                    ))}
                  </select>
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
                      variant="outline"
                      type="button"
                      onClick={() => setEditingTaskId(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
