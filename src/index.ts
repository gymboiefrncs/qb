import { pool } from "./db.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
import { QueryExecutor } from "./lib/core/query-executor.js";
import type { TableMap } from "./types/queries.js";
async function test() {
  const executor = new QueryExecutor<TableMap>(pool);
  try {
    const d = executor.delete("users").where("id", "=", 1);
    await executor.execute(d);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
