import type { Pool } from "pg";
import type { ExecutableQuery, PrimitiveTypes } from "../../types/queries.js";
import { InsertQuery } from "./insert-query.js";
import { SelectQuery } from "./select-query.js";

export class QueryExecutor<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
> {
  #db: Pool;
  constructor(db: Pool) {
    this.#db = db;
  }

  insert<T extends keyof TTable>(table: T) {
    return new InsertQuery<TTable, T>(table);
  }

  select<T extends keyof TTable>(table: T) {
    return new SelectQuery<TTable, T>(table);
  }

  // perform sql insert statement
  async execute(query: ExecutableQuery) {
    const { sql, bindings } = query.toSql();
    return await this.#db.query(sql, bindings);
  }
}
