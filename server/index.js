import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import supervisorRoutes from './routes/supervisors.js'
import coordinatorRoutes from './routes/coordinators.js'
import panelRoutes from './routes/panels.js'
import notificationRoutes from './routes/notifications.js'
import { initDatabase } from './database/init.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/api/files', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/supervisors', supervisorRoutes)
app.use('/api/coordinators', coordinatorRoutes)
app.use('/api/panels', panelRoutes)
app.use('/api/notifications', notificationRoutes)

// Initialize database
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error('Failed to initialize database:', err)
})

export default app

