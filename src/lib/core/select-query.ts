import type {
  ValidOperators,
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
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): SelectQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value });
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
  }

  andWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): SelectQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value, connector: "AND" });
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
  }

  orWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): SelectQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value, connector: "OR" });
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
  }

  andWhereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: "IS NULL",
  ): SelectQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value: null, connector: "AND" });
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
  }

  orWhereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: "IS NULL",
  ): SelectQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value: null, connector: "OR" });
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
  }

  whereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: "IS NULL",
  ) {
    this._conditions.push({ column, operator, value: null });
    return this as unknown as SelectQuery<TTable, T, HasWhere>;
  }

  whereNotNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: "IS NOT NULL",
  ) {
    this._conditions.push({ column, operator, value: null });
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

    const { clause, bindings } = this._buildWhereClause(this._conditions);

    let sql = `SELECT ${this._columns.join(", ")} FROM ${String(this._table)}`;
    if (clause) sql += clause;
    return { sql, bindings };
  }
}
