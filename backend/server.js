// server.js
import express from 'express'
import cors from 'cors'
import sql from './db/index.js'   // import default from db connection
import dotenv from 'dotenv'
import authRoutes from "./routes/auth.js";

dotenv.config()  // load .env variables

const app = express()
app.use(cors())
app.use(express.json())

// Register Auth Routes
app.use("/auth", authRoutes)  

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running!')
})

// Test DB route — fetch first 5 users
app.get('/test-db', async (req, res) => {
  try {
    const users = await sql`SELECT * FROM "User" LIMIT 5;`
    res.json({ success: true, users })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
