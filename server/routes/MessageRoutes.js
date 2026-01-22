import { Router } from "express";
import {
  addAudioMessage,
  addImageMessage,
  addMessage,
  getInitialContactsWithMessages,
  getMessages,
} from "../controllers/MessageController.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

/* ✅ Base uploads directory (Render-safe) */
const uploadBasePath = path.join(process.cwd(), "uploads");
const imagePath = path.join(uploadBasePath, "images");
const audioPath = path.join(uploadBasePath, "recordings");

/* ✅ Ensure directories exist */
[uploadBasePath, imagePath, audioPath].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/* ✅ Multer configs */
const uploadImage = multer({ dest: imagePath });
const uploadAudio = multer({ dest: audioPath });

/* ✅ Routes */
router.post("/add-message", addMessage);
router.get("/get-messages/:from/:to", getMessages);

router.post(
  "/add-image-message",
  uploadImage.single("image"),
  addImageMessage
);

router.post(
  "/add-audio-message",
  uploadAudio.single("audio"),
  addAudioMessage
);

router.get(
  "/get-initial-contacts/:from",
  getInitialContactsWithMessages
);

export default router;
