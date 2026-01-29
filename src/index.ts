import { pool } from "./db.js";
import { InsertQuery } from "./lib/core/insert-query.js";
// import { InsertQuery } from "./lib/core/insert-query.js";
import { QueryExecutor } from "./lib/core/query-executor.js";
import { SelectQuery } from "./lib/core/select-query.js";
import type { User } from "./types/queries.js";

async function test() {
  const executor = new QueryExecutor(pool);
  try {
    const i = await executor.insert(
      new InsertQuery<User>("users")
        .values({
          age: 5,
          name: "ddfa",
          is_admin: true,
        })
        .returning("name"),
    );
    const s = await executor.select(
      new SelectQuery<User>("users").columns().where("id", "=", 1),
    );
    console.log("select", i.rows);

    console.log("select", s.rows);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
