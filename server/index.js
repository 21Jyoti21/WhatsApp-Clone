import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import CallLogRoutes from "./routes/CallLogRoutes.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "https://whats-app-clone-eosin.vercel.app" // 👈 your Vercel domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads/recordings", express.static("uploads/recordings"));
app.use("/uploads/images", express.static("uploads/images"));

app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/calls", CallLogRoutes);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://whats-app-clone-eosin.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});


global.onlineUsers = new Map();

io.on("connection", (socket) => {
  // global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(String(userId), socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });
  socket.on("signout", (id) => {
    onlineUsers.delete(String(id));
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("send-msg", (data) => {
    if (!data || !data.to || !data.from || !data.message) {
      console.error("[Server] Invalid send-msg data:", data);
      return;
    }

    if (data.to === data.from) {
      console.warn("[Server] Ignoring socket send to self");
      return;
    }

    const sendUserSocket = onlineUsers.get(String(data.to));

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", {
        ...data.message,
        senderId: data.from,
        recieverId: data.to,
      });
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const { to, from, callType, roomId } = data;
    const sendUserSocket = onlineUsers.get(String(to));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from,
        roomId,
        callType,
      });
    }
  });

  socket.on("outgoing-video-call", (data) => {
    const { to, from, callType, roomId } = data;
    const sendUserSocket = onlineUsers.get(String(to));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from,
        roomId,
        callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const { from } = data;
    const sendUserSocket = onlineUsers.get(String(from));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });

  socket.on("reject-video-call", (data) => {
    const { from } = data;
    const sendUserSocket = onlineUsers.get(String(from));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });

  // socket.on("send-msg", (data) => {

  //   if (!data || !data.to || !data.from || !data.message) {
  //     console.error("[Server] Invalid send-msg data:", data);
  //     return;
  //   }

  //   if (data.to === data.from) {
  //     console.warn("[Server] Ignoring socket send to self");
  //     return;
  //   }

  //   const sendUserSocket = onlineUsers.get(String(data.to));

  //   if (sendUserSocket) {
  //     const messagePayload = {
  //       message: {
  //         ...data.message,
  //         senderId: data.from,
  //         recieverId: data.to,
  //       }
  //     };
  //     socket.to(sendUserSocket).emit("msg-recieve", messagePayload);
  //   } else {
  //     console.warn("[Server] Receiver offline or not found");
  //   }
  // });
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(String(data.to));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });
  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(String(data.to));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });
  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(String(data.from));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });
  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(String(data.from));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });
  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(String(id));
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("accept-call");
    }
  });
  socket.on("end-call", (data) => {
    const { to } = data;
    const sendUserSocket = onlineUsers.get(String(to));

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("end-call");
    } else {
      console.warn("[Server] User not found for end-call:", to);
    }
  });
  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });
  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });
  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("accept-call");
    }
  });
});
