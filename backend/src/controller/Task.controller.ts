import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import prisma from "../db/db";
import path from "path";
import fs from "fs";

// Create Task
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;

    const finalAssignedTo =
      req.user.role === "admin" ? Number(assignedTo) : req.user.id;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedTo: finalAssignedTo,
        assignedBy: req.user.id,
      },
    });

    if (req.files && Array.isArray(req.files)) {
      const docs = req.files.map((file: Express.Multer.File) => ({
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        filepath: file.path,
        url: `/uploads/${file.filename}`,
        taskId: task.id,
      }));

      await prisma.document.createMany({
        data: docs,
      });
    }

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating task", error: error.message });
  }
};

// Get all tasks
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await prisma.task.findMany({
        include: { user: true, assigner: true, documents: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { assignedTo: req.user.id },
        include: { user: true, assigner: true, documents: true },
      });
    }

    res.status(200).json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
};

/* ---------------------- GET DOCUMENTS BY TASK ---------------------- */
export const getDocumentsByTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docs = await prisma.document.findMany({
      where: { taskId: Number(id) },
    });
    res.status(200).json(docs);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching documents", error: error.message });
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id: Number(id) } });

    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (!doc.filepath)
      return res.status(404).json({ message: "File path not found" });

    const filePath = path.resolve(doc.filepath);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "File not found" });

    res.download(filePath, doc.filename);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error downloading document", error: error.message });
  }
};

// Get single task
export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(task);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching task", error: error.message });
  }
};

// Update task
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Convert dueDate
    const dueDateValue =
      req.body.dueDate && req.body.dueDate !== ""
        ? new Date(req.body.dueDate)
        : null;
    if (dueDateValue && isNaN(dueDateValue.getTime())) {
      return res.status(400).json({ message: "Invalid dueDate format" });
    }

    const { title, description, status, priority, assignedTo } = req.body;

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDateValue,
        assignedTo: assignedTo ? Number(assignedTo) : task.assignedTo,
      },
    });

    // Handle uploaded files
    if (req.files) {
      const filesData = (req.files as Express.Multer.File[]).map((file) => ({
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        taskId: updatedTask.id,
      }));

      await prisma.document.createMany({ data: filesData });
    }

    // fetch updated task with documents
    const taskWithDocs = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: { documents: true },
    });

    res.status(200).json({ message: "Task updated successfully", updatedTask: taskWithDocs });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};


export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const taskId = Number(id);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete all documents related to the task
    await prisma.document.deleteMany({
      where: { taskId },
    });

    // Delete the task
    await prisma.task.delete({ where: { id: taskId } });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};

