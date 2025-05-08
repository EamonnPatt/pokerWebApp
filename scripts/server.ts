// src/server.ts  (or server.js if you prefer CommonJS)
import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Game } from "holdem-poker";

import { User } from "./models/User.js";

// ────────────────────────────────────────────────────────────────────────────
// MongoDB (unchanged)
const MONGO_URI =
  "mongodb+srv://admin:dbpass@pokercluster1.rgp8gh8.mongodb.net/";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("[DB] MongoDB connected"))
  .catch((err) => {
    console.error("[DB] MongoDB connection error:", err);
    process.exit(1);
  });

// ────────────────────────────────────────────────────────────────────────────
// Express setup (unchanged)
export const app = express();
const port = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../../")));
app.use("/dist", express.static(path.join(__dirname, "../dist")));
app.use("/views", express.static(path.join(__dirname, "../../views")));

// ────────────────────────────────────────────────────────────────────────────
// REST routes (all of your existing ones) –– UNCHANGED
// … (register / login / profile routes here – just copied verbatim) …

//#region  ▶▶  USER / AUTH ROUTES  ◀◀
app.post("/api/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new Error("Username and pass required");;
  }

  try {
    const existing = await User.findOne({ username });
    if (existing) throw new Error("User already exists");;

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).send("Registration failed");
  }
});

app.post("/api/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) throw new Error("missing fields");;

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password)
      throw new Error("invalid credentials");
    res.json({ username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
});
//#endregion

//#region ▶▶  PROFILE ROUTES  ◀◀
interface UserData {
  username: string;
  alias?: string;
  description?: string;
}

app.get("/api/profile", async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    if (!username) throw new Error("Username required");

    const user = await User.findOne({ username });
    if (!user) throw new Error("User not found");

    const { alias = "", description = "" } = user as UserData;
    res.json({ username, alias, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.post("/api/profile", async (req: Request, res: Response) => {
  try {
    const { username, alias, description } = req.body;
    if (!username) throw new Error("Username required");

    await User.updateOne(
      { username },
      { $set: { alias, description } },
      { runValidators: true }
    );

    const user = (await User.findOne({ username })) as UserData;
    res.json({
      username: user.username,
      alias: user.alias ?? "",
      description: user.description ?? "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
//#endregion

// ────────────────────────────────────────────────────────────────────────────
//  SOCKET.IO  ––– Poker table logic
const httpServer = createServer(app);        // <-- Socket.IO shares the same port
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },                     // loosen if you deploy elsewhere
});

// one 2‑seat table (100 chips each, 10‑chip ante)
const game = new Game([100, 100], 10);
game.startRound();

type PlayerID = string;                       // socket.id
const seat: (PlayerID | null)[] = [null, null];

function broadcastState() {
  io.emit("state", game.getState());
}

io.on("connection", (socket: Socket) => {
  console.log("[WS] connected", socket.id);

  // --- seat assignment -----------------------------------------------------
  socket.on("sit", () => {
    const idx = seat.findIndex((s) => s === null);
    if (idx === -1) return socket.emit("seatRejected");
    seat[idx] = socket.id;
    socket.emit("seated", idx);
    broadcastState();
  });

  // --- player actions ------------------------------------------------------
  socket.on("action", ({ move, amount }: { move: string; amount?: number }) => {
    const idx = seat.indexOf(socket.id);
    if (idx === -1) return; // not seated

    try {
      switch (move) {
        case "bet":
          game.bet(idx);
          break;
        case "check":
          game.check(idx);
          break;
        case "raise":
          game.raise(idx, amount ?? 0);
          break;
        case "call":
          game.call(idx);
          break;
        case "fold":
          game.fold(idx);
          break;
      }

      // round / hand progression
      if (game.canEndRound()) {
        game.endRound();
        if (game.getState().communityCards.length === 5) {
          const result = game.checkResult();
          io.emit("result", result);

          // reset for next hand – keep remaining stacks
          const stacks = game.getState().players.map((p) => p.money);
          const next = new Game(stacks, 10);
          Object.assign(game, next);
          game.startRound();
        } else {
          game.startRound();
        }
      }

      broadcastState();
    } catch (err) {
      socket.emit("errorMsg", (err as Error).message);
    }
  });

  // --- disconnect ----------------------------------------------------------
  socket.on("disconnect", () => {
    const idx = seat.indexOf(socket.id);
    if (idx !== -1) seat[idx] = null;
    broadcastState();
  });

  socket.emit("hello");
  broadcastState();
});

// ────────────────────────────────────────────────────────────────────────────
// Start HTTP + WebSocket server
httpServer.listen(port, () =>
  console.log(`[INFO] Server (REST + WS) running on http://localhost:${port}`)
);
