import type { PrimitiveTypes } from "../../types/queries.js";
import { BaseQuery } from "./base-query.js";

export class SelectQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
> extends BaseQuery<TTable, T> {
  columns(...col: Array<keyof TTable[T] | "*">): this {
    this._columns = col.length ? col : ["*"];
    return this;
  }

  /**
   * @internal For debugging only.
   * Use QueryExecutor instance.execute() in normal usage.
   *
   * @returns an object containing sql statement and bindings
   */
  toSql() {
    if (!this._table) throw new Error("SelectQueryError: table not specified");
    if (!this._columns)
      throw new Error("SelectQueryError: column not provided");

    let placeholder = 1;
    // if theres only one condition, dont add prefix. otherwise, add prefix
    const condition = this._conditions
      .map((c, i) => {
        const prefix = i === 0 ? "" : ` ${c.connector}`;
        return `${prefix} ${c.column} ${c.operator} $${placeholder++}`;
      })
      .join("");

    const whereClause = condition ? ` WHERE${condition}` : "";

    const bindings = this._conditions.map((c) => c.value);
    const sql = `SELECT ${this._columns.join(", ")} FROM ${String(this._table)}${whereClause}`;

    return { sql, bindings };
  }
}
