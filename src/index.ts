import { pool } from "./db.js";
import { InsertQuery, QueryExecutor, SelectQuery } from "./lib/core.js";

async function test() {
  const executor = new QueryExecutor(pool);
  try {
    const insert = new InsertQuery();
    const qb = new SelectQuery();

    insert.insert("users").value({ name: "sample", is_admin: false });
    qb.select().from("users");

    const { sql, bindings } = insert.toSql();
    await executor.run(sql, bindings);
    const result = await executor.run(qb.toSql());
    console.log(result.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
    console.log("Connection closed");
  }
}

test();
