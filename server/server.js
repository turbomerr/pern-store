import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"

import productRoutes from "./routes/productRoutes.js"
import { sql } from "./config/db.js"
import { aj } from "./lib/arcjet.js"


const app = express()

dotenv.config({path : ""});

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve()

app.use(express.json())
app.use(cors())
app.use(helmet({
  contentSecurityPolicy : false
})) //helmet is a security middleware that helps you protect your app by setting various HTTP heaaders
app.use(morgan("dev"))// log the request to the console


 app.use(async (req, res, next) => {
   try {
    const decision = await aj.protect(req, { requested: 1 });
    console.log("Arcjet decision: ", decision);

     if (decision.isDenied()) {
       if (decision.reason.isRateLimit()) {
         res.status(429).json({ error: "Too many request!" })
       } else if (decision.reason.isBot()) {
         res.status(403).json({ error: "Bot access denied" });
       } else {
         res.status(403).json({ error: "Forbidden" });
       }
       return;
     }
     else if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
       res.status(403).json({ error: "Spoofed bot detected" });
       return;
     }

     next()
   } catch (error) {
     console.log("Arcjet error", error);
     next(error);
   }
 })
  

app.use("/api/products", productRoutes);

if(process.env.NODE_ENV === "production"){
  //server our react app

  app.use(express.static(path.join(__dirname, "/client/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
  })
}

async function initDB() {
  try {
    //SERIAL =>  auto-incrementing integer columns, start at 1 and increase
    await sql`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY, 
          name VARCHAR(255) NOT NULL,
          image VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

    console.log("Database initialized successfully");
    

  } catch (error) {
    console.log("Error initDB", error);

  }
}


initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    console.log("database : ", process.env.PGDATABASE);
  });
});  