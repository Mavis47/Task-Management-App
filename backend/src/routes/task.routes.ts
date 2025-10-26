import express from "express"
import { createTask, deleteTask, downloadDocument, getAllTasks, getDocumentsByTask, getTaskById, updateTask } from "../controller/Task.controller";
import { authenticate } from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";


const router = express.Router();

router.post("/createTask",upload.array("documents", 5),authenticate,createTask);
router.get("/getAllTask",authenticate,getAllTasks);
router.get("/getTaskById",authenticate,getTaskById);
router.patch("/updateTask/:id",upload.array("documents", 5),authenticate,updateTask);
router.delete("/deleteTask/:id",authenticate,deleteTask);

// Document routes
router.get("/documents/:id", authenticate, getDocumentsByTask);       // Get all documents for a task
router.get("/documents/download/:id", authenticate, downloadDocument);

export default router;