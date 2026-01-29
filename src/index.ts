import { pool } from "./db.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
import { QueryExecutor } from "./lib/core/query-executor.js";
import type { TableMap } from "./types/queries.js";
async function test() {
  const executor = new QueryExecutor<TableMap>(pool);
  try {
    const i = executor
      .insert("users")
      .values(
        { name: "francis", is_admin: true, age: 2 },
        { name: "djnaf", age: 9 },
      )
      .returning();
    const s = executor.select("users").columns();
    const insertResult = await executor.execute(i);
    const selectResult = await executor.execute(s);
    console.log(insertResult.rows);
    console.log(selectResult.rows);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
