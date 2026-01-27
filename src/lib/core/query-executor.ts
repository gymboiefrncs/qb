import type { Pool, QueryResult } from "pg";
import type { PrimitiveTypes } from "../../types/queries.js";
import { TO_SQL } from "../../types/queries.js";
import { InsertQuery } from "./insert-query.js";
export class QueryExecutor {
  #db: Pool;
  constructor(db: Pool) {
    this.#db = db;
  }

  // perform sql insert statement
  async insert<T extends Record<string, PrimitiveTypes>>(
    query: InsertQuery<T>,
  ): Promise<QueryResult<T>> {
    const { sql, bindings } = query[TO_SQL]();
    console.log(sql, bindings);
    return await this.#db.query<T>(sql, bindings);
  }
}
