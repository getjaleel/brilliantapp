import { pool } from "./src/lib/db.ts";

async function test() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB connected:", result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("DB error:", err.message);
    process.exit(1);
  }
}

test();
