import type { Pool } from "pg";
import type {
  ExecutableQuery,
  PrimitiveTypes,
  NoWhere,
} from "../../types/queries.js";
import { InsertQuery } from "./insert-query.js";
import { SelectQuery } from "./select-query.js";
import { UpdateQuery } from "./update-query.js";
import { DeleteQuery } from "./delete-query.js";

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

  select<T extends keyof TTable>(table: T): SelectQuery<TTable, T, NoWhere> {
    return new SelectQuery<TTable, T, NoWhere>(table);
  }

  update<T extends keyof TTable>(table: T): UpdateQuery<TTable, T, NoWhere> {
    return new UpdateQuery<TTable, T, NoWhere>(table);
  }

  delete<T extends keyof TTable>(table: T): DeleteQuery<TTable, T, NoWhere> {
    return new DeleteQuery<TTable, T, NoWhere>(table);
  }

  // perform sql insert statement
  async execute(query: ExecutableQuery) {
    const { sql, bindings } = query.toSql();
    console.log(sql, bindings);
    return await this.#db.query(sql, bindings);
  }
}
