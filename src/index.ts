import { pool } from "./db.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
import { QueryExecutor } from "./lib/core/query-executor.js";
import type { TableMap } from "./types/queries.js";
async function test() {
  const executor = new QueryExecutor<TableMap>(pool);
  try {
    const s = executor
      .select("users")
      .columns()
      .where("age", ">=", 18)
      .andWhere("age", ">", 18)
      .orWhere("name", "LIKE", "%John%")
      .orWhereNull("is_admin", "IS NULL")
      .andWhereNull("is_admin", "IS NULL");
    const u = executor
      .update("users")
      .set({})
      .whereNull("is_admin", "IS NULL")
      .andWhere("age", ">", 18)
      .orWhere("name", "LIKE", "%John%")
      .orWhereNull("is_admin", "IS NULL")
      .andWhereNull("is_admin", "IS NULL");
    const d = executor
      .delete("users")
      .where("age", ">=", 18)
      .andWhere("age", ">", 18)
      .orWhere("name", "LIKE", "%John%")
      .orWhereNull("is_admin", "IS NULL")
      .andWhereNull("is_admin", "IS NULL");
    await executor.execute(s);
    await executor.execute(u);
    await executor.execute(d);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
