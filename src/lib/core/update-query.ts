import type {
  Operators,
  PrimitiveTypes,
  HasWhere,
} from "../../types/queries.js";
import { BaseQuery } from "./base-query.js";

export class UpdateQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
  State extends { _hasWhere: boolean },
> extends BaseQuery<TTable, T> {
  #updates: Partial<TTable[T]> = {};

  set(updates: Partial<TTable[T]>): this {
    this.#updates = { ...this.#updates, updates };

    return this;
  }

  where<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): UpdateQuery<TTable, T, HasWhere> {
    this._where(column, operator, value);
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
  }

  andWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): UpdateQuery<TTable, T, HasWhere> {
    this._andWhere(column, operator, value);
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
  }

  orWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): UpdateQuery<TTable, T, HasWhere> {
    this._orWhere(column, operator, value);
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
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
