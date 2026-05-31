import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { logger } from "./logger";
import type { PresentationState } from "../types/presentation";

let io: SocketIOServer | null = null;

const defaultState: PresentationState = {
  active: false,
  cleared: true,
  verse: null,
  typography: {
    fontFamily: "Noto Sans Telugu",
    fontSize: 56,
    fontWeight: "bold",
    textAlign: "center",
    textColor: "#ffffff",
    lineHeight: 1.3,
    shadow: true,
    outline: false,
    outlineWidth: 2,
    showReference: true,
  },
  background: {
    type: "solid",
    color: "#0f172a",
    gradientStart: "#1e1b4b",
    gradientEnd: "#0f172a",
    gradientDirection: "to bottom",
    imageUrl: null,
  },
  transition: {
    type: "fade",
    duration: 500,
  },
};

let currentState: PresentationState = { ...defaultState };

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket client connected");

    // Send current state to newly connected client
    socket.emit("presentation:sync", currentState);

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket client disconnected");
    });
  });

  logger.info("Socket.IO initialized");
  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function getCurrentState(): PresentationState {
  return currentState;
}

export function updateState(partial: Partial<PresentationState>): PresentationState {
  currentState = { ...currentState, ...partial };
  if (io) {
    io.emit("presentation:update", currentState);
  }
  return currentState;
}

export function clearState(): PresentationState {
  currentState = { ...currentState, cleared: true, active: false };
  if (io) {
    io.emit("presentation:clear", currentState);
  }
  return currentState;
}
