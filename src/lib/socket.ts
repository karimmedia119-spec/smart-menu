"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket && typeof window !== "undefined") {
    socket = io(window.location.origin, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected successfully with ID:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });
  }
  return socket as Socket;
};

export const joinTenantRoom = (tenantId: string, role: "customer" | "kitchen" | "cashier" | "admin" = "customer") => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit("join_tenant", { tenantId, role });
  } else if (s) {
    s.once("connect", () => {
      s.emit("join_tenant", { tenantId, role });
    });
  }
};
