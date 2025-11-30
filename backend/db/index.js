import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL)

async function test() {
  try {
    const result = await sql`SELECT 1`
    console.log('DB connection OK:', result)
  } catch (err) {
    console.error('DB connection error:', err.message)
  }
}

test()

export default sql
