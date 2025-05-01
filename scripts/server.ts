import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "./models/User.js"; //,js

//DB
import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://admin:dbpass@pokercluster1.rgp8gh8.mongodb.net/";


mongoose.connect(MONGO_URI)
  .then(() => console.log("[DB] MongoDB connected"))
  .catch(err => {
    console.error("[DB] MongoDB connection error:", err);
    process.exit(1);
});


//END DB

export const app = express();
const port = 4000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve root directory (for styles.css and index.html)
app.use(express.static(path.join(__dirname, "../../")));
// Serve dist directory for scripts
app.use("/dist", express.static(path.join(__dirname, "../dist")));
// Serve views directory
app.use("/views", express.static(path.join(__dirname, "../../views")));

// Serve main HTML file
app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../index.html"));
});

///db routes

app.get("/api/:username", async (req: Request, res: Response) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.json(user);
});

app.post("/api/register", express.json(), async (req: Request, res: Response) => {
  console.log("serv reg")

    const { username, password } = req.body;
  
    if (!username || !password) {
       throw new Error("incorrect username or password");
    }
  
    try {
       const existingUser = await User.findOne({ username });
       if (existingUser) {
         throw new Error("user already exists");
       }
    
       const user = new User({ username, password });
       await user.save();
  
       res.status(201).json({ username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).send("Registration failed");
  }
});

  app.post("/api/login", express.json(), async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        throw new Error("invalid username or password");
    }
    
    try {
        const user = await User.findOne({ username });
    
        if (!user || user.password !== password) {
          throw new Error("invalid credentials");
        }
    
        // Simulated session: send user info to frontend
        res.status(200).json({ username: user.username, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).send("Login failed");
    }
});
    
///end db routes

// Start server
app.listen(port, () => {
    console.log(`[INFO] Server started on http://localhost:${port}`);
});

