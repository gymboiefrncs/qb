import { pool } from "./db.js";
import { InsertQuery, QueryExecutor, SelectQuery } from "./lib/core.js";
import type { User } from "./types/queries.js";

async function test() {
  const executor = new QueryExecutor(pool);
  try {
    const insert = new InsertQuery<Omit<User, "id">>();
    const qb = new SelectQuery<User>();

    insert.insert("users").value({ name: "sample again", is_admin: false });
    qb.select().from("users");

    await executor.run<User>(insert);
    const result = await executor.run<User>(qb);
    console.log(result.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
