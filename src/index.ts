import { pool } from "./db.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
import { QueryExecutor } from "./lib/core/query-executor.js";
import type { TableMap } from "./types/queries.js";
async function test() {
  const executor = new QueryExecutor<TableMap>(pool);
  try {
    // const i = executor
    //   .insert("users")
    //   .values({ name: "some name", age: 12, is_admin: true })
    //   .returning();

    const u = executor
      .update("users")
      .set({ name: "some" })
      .where("id", "=", 1)
      .returning("*");

    const updateResult = await executor.execute(u);
    // const insertResult = await executor.execute(i);
    // console.log("Insert", insertResult.rows[0]);
    console.log("Update", updateResult.rows[0]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
