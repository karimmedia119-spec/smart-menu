const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Socket.io Server for Sub-100ms real-time sync
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Join tenant room
    socket.on("join_tenant", ({ tenantId, role }) => {
      if (!tenantId) return;
      const room = `tenant:${tenantId}`;
      socket.join(room);
      console.log(`[Socket] Client ${socket.id} joined ${room} as ${role || "guest"}`);
      socket.emit("joined_tenant", { room, socketId: socket.id });
    });

    // New order placed by customer in the dining room
    socket.on("order:new", (data) => {
      if (!data || !data.tenantId) return;
      const room = `tenant:${data.tenantId}`;
      console.log(`[Socket] New Order #${data.orderNumber} in ${room}`);
      // Broadcast to all clients in the tenant room (KDS, Cashier, Customer)
      io.to(room).emit("order:created", data);
    });

    // Order status update (e.g. preparing -> ready -> completed)
    socket.on("order:update_status", (data) => {
      if (!data || !data.tenantId) return;
      const room = `tenant:${data.tenantId}`;
      console.log(`[Socket] Order #${data.orderNumber} status changed to ${data.status}`);
      io.to(room).emit("order:status_updated", data);
    });

    // Payment collected by cashier
    socket.on("order:payment_status", (data) => {
      if (!data || !data.tenantId) return;
      const room = `tenant:${data.tenantId}`;
      console.log(`[Socket] Order #${data.orderNumber} paid via ${data.paymentMethod}`);
      io.to(room).emit("order:payment_updated", data);
    });

    // Customer calls waiter or requests bill from table
    socket.on("order_point:call_waiter", (data) => {
      if (!data || !data.tenantId) return;
      const room = `tenant:${data.tenantId}`;
      console.log(`[Socket] Call waiter from ${data.orderPointLabel} #${data.orderPointName}: ${data.type}`);
      io.to(room).emit("order_point:waiter_called", data);
    });

    // Subscription verification or plan update
    socket.on("subscription:updated", (data) => {
      if (!data || !data.tenantId) return;
      const room = `tenant:${data.tenantId}`;
      io.to(room).emit("tenant:subscription_changed", data);
    });

    socket.on("disconnect", () => {
      // Disconnected
    });
  });

  server.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
