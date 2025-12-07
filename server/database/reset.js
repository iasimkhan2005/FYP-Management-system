import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../../fyp.db')

// Delete existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('Existing database deleted')
}

console.log('Database reset complete. Restart the server to initialize with demo data.')

