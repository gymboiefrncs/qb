import type { PrimitiveTypes } from "../../types/queries.js";
import { BaseQuery } from "./base-query.js";

export class DeleteQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
> extends BaseQuery<TTable, T> {
  toSql(): { sql: string; bindings: unknown[] } {
    let placeholder = 1;
    // if theres only one condition, dont add prefix. otherwise, add prefix

    const condition = this._conditions
      .map((c, i) => {
        const prefix = i === 0 ? "" : ` ${c.connector}`;
        return `${prefix} ${c.column} ${c.operator} $${placeholder++}`;
      })
      .join("");

    const bindings = this._conditions.map((c) => c.value);
    const whereClause = condition ? ` WHERE${condition}` : "";

    const sql = `DELETE FROM ${String(this._table)}${whereClause}`;
    return { sql, bindings };
  }
}
