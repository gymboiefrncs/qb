import type {
  Operators,
  PrimitiveTypes,
  HasWhere,
} from "../../types/queries.js";
import { BaseQuery } from "./base-query.js";

export class SelectQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
  State extends { _hasWhere: boolean },
> extends BaseQuery<TTable, T> {
  columns(...col: Array<keyof TTable[T] | "*">): this {
    this._columns = col.length ? col : ["*"];
    return this;
  }

  where<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): SelectQuery<TTable, T, HasWhere> {
    this._where(column, operator, value);
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
  }

  andWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): SelectQuery<TTable, T, HasWhere> {
    this._andWhere(column, operator, value);
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
  }

  orWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): SelectQuery<TTable, T, HasWhere> {
    this._orWhere(column, operator, value);
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
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
