import { pool } from "./db.js";
import { InsertQuery, QueryExecutor } from "./lib/core.js";
import type { User, UserWithoutID } from "./types/queries.js";

async function test() {
  const executor = new QueryExecutor(pool);
  try {
    const result = await executor.insert<UserWithoutID>(
      new InsertQuery<Omit<User, "id">>()
        .value(
          { name: "test 3", is_admin: false },
          { is_admin: true, name: "ds" },
        )
        .returning()
        .insert("users"),
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
