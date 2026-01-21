import { Router } from "express";
import { addCallLog, getCallLogsForUser } from "../controllers/CallLogController.js";
const router = Router();
router.post("/add-log", addCallLog);
router.get("/get-logs/:userId", getCallLogsForUser);
export default router;