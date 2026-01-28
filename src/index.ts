import { pool } from "./db.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
import { QueryExecutor } from "./lib/core/query-executor.js";
import { SelectQuery } from "./lib/core/select-query.js";
import type { User } from "./types/queries.js";

async function test() {
  const executor = new QueryExecutor(pool);
  try {
    executor.select(
      new SelectQuery<User>("users")
        .columns("id")
        .where("id", "=", 8)
        .andWhere("is_admin", "!=", true)
        .orWhere("is_admin", "!=", true),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
