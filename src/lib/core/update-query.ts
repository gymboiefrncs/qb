import type { PrimitiveTypes } from "../../types/queries.js";
import { BaseQuery } from "./base-query.js";

export class UpdateQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
> extends BaseQuery<TTable, T> {
  #updates: Partial<TTable[T]> = {};

  set(updates: Partial<TTable[T]>): this {
    this.#updates = { ...this.#updates, updates };

    return this;
  }

  /**
   * @internal For debugging only.
   * Use QueryExecutor instance.execute() in normal usage.
   *
   * @returns an object containing sql statement and bindings
   */
  toSql(): { sql: string; bindings: unknown[] } {
    if (!this._table) throw new Error("UpdateQueryError: table not specified");

    let placeholder = 1;
    const setClause: unknown[] = [];
    const bindings: unknown[] = [];

    // generate setClause
    for (const key in this.#updates) {
      bindings.push(this.#updates[key]);
      setClause.push(`${key} = $${placeholder++}`);
    }

    // if theres only one condition, dont add prefix. otherwise, add prefix
    const condition = this._conditions
      .map((c, i) => {
        bindings.push(c.value);
        const prefix = i === 0 ? "" : ` ${c.connector}`;
        return `${prefix} ${c.column} ${c.operator} $${placeholder++}`;
      })
      .join("");

    const returning = this._columns
      ? `RETURNING ${this._columns.join(", ")}`
      : "";

    const whereClause = condition ? ` WHERE${condition}` : "";
    const sql = `Update ${String(this._table)} SET ${setClause.join(", ")}${whereClause} ${returning}`;

    return { sql, bindings };
  }
}
