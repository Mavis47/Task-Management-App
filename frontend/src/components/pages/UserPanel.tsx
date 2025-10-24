"use client";

import React, { useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ArrowUpDown, Bell } from "lucide-react";

// Mock current user
const currentUser = { id: 2, name: "Bob", role: "user" };

// Mock Data (same as Admin Panel)
const initialData = [
  { id: 1, name: "Alice", task: "Design Homepage", status: "In Progress" },
  { id: 2, name: "Bob", task: "Fix Login Bug", status: "Completed" },
  { id: 3, name: "Charlie", task: "Update Docs", status: "Pending" },
  { id: 4, name: "David", task: "Add New Feature", status: "In Progress" },
  { id: 5, name: "Eva", task: "Test Payment Flow", status: "Completed" },
  { id: 6, name: "Frank", task: "Review PR", status: "Pending" },
  { id: 7, name: "Grace", task: "Refactor API", status: "In Progress" },
];

export default function UserPanel() {
  // Filter out the logged-in user
  const [users] = useState(initialData.filter((u) => u.id !== currentUser.id));

  const [sortField, setSortField] = useState<keyof typeof initialData[0]>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 4;

  // Filtering
  const filteredData = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(filter.toLowerCase()) ||
        user.task.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, users]);

  // Sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const toggleSort = (field: keyof typeof initialData[0]) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 p-6">
      {/* Sidebar */}
      <div className="w-1/5 bg-white border-r p-6 flex flex-col justify-between rounded-l-2xl shadow">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </h2>
          <div className="text-gray-500 text-sm">
            No new notifications.
          </div>
        </div>
        <div>
          <Button variant="ghost" className="w-full">
            Settings
          </Button>
        </div>
      </div>

      {/* Main User Panel */}
      <Card className="flex-1 rounded-r-2xl shadow-lg ml-4 p-4">
        <CardHeader className="flex flex-col gap-4 items-center">
          <CardTitle className="text-2xl font-semibold">User Panel</CardTitle>
          <Button className="text-lg px-6">Assign Task</Button>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search by name or task..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => toggleSort("name")} className="cursor-pointer">
                    Name <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead onClick={() => toggleSort("task")} className="cursor-pointer">
                    Task <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead onClick={() => toggleSort("status")} className="cursor-pointer">
                    Status <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.task}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Assign
                      </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
