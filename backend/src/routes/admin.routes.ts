import express from "express";
import { createUser, deleteUser, getAllUsers, updateUser } from "../controller/AdminTask.controller";
import { authenticate, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/createUser",authenticate,isAdmin, createUser);  
router.get("/getAllUsers", authenticate, isAdmin, getAllUsers); 
router.put("/updateUser/:id", authenticate, isAdmin, updateUser); 
router.delete("/deleteUser/:id",authenticate,isAdmin, deleteUser);

export default router;