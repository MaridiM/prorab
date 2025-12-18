import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'

// Database connection from environment (.env file)
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  user: process.env.POSTGRES_USER || 'prorab',
  password: process.env.POSTGRES_PASSWORD || 'prorab',
  database: process.env.POSTGRES_DATABASE || 'prorab',
})

async function runMigration() {
  const client = await pool.connect()

  try {
    console.log('🚀 Starting Stage 14 migration...')
    console.log(`📊 Database: ${process.env.DATABASE_NAME || 'prorab'} @ ${process.env.DATABASE_HOST || 'localhost'}:${process.env.DATABASE_PORT || '5433'}\n`)

    // Read SQL file
    const sqlPath = path.join(__dirname, 'migrate-business-roles.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📝 Executing migration SQL...\n')

    // Execute the entire SQL script
    const result = await client.query(sql)

    console.log('\n✅ Migration completed successfully!')

    // Show notices (RAISE NOTICE messages from SQL)
    if (result && (result as any).notices) {
      console.log('\n📋 Migration output:')
      ;(result as any).notices.forEach((notice: any) => {
        console.log(notice.message)
      })
    }
  } catch (error) {
    console.error('\n❌ Migration failed!')
    console.error('Error:', (error as Error).message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
