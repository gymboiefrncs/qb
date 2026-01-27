import { pool } from "./db.js";
import { InsertQuery, QueryExecutor } from "./lib/core.js";
import type { User } from "./types/queries.js";

async function test() {
  const executor = new QueryExecutor(pool);
  try {
    const result = await executor.insert(
      new InsertQuery<User>("users")
        .values(
          { name: "something", age: null },
          { name: "something", age: 3 },
          { age: null, name: "ndek" },
        )
        .returning("id", "is_admin"),
    );

    console.log(result.rows);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
