import type {
  ValidOperators,
  PrimitiveTypes,
  HasWhere,
} from "../../types/queries.js";
import { BaseQuery } from "./base-query.js";

export class DeleteQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
  State extends { _hasWhere: boolean },
> extends BaseQuery<TTable, T> {
  where<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): DeleteQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value });
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  andWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): DeleteQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value, connector: "AND" });
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  orWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): DeleteQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value, connector: "OR" });
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  andWhereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: "IS NULL",
  ): DeleteQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value: null, connector: "AND" });
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  orWhereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: "IS NULL",
  ): DeleteQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value: null, connector: "OR" });
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  whereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: "IS NULL",
  ): DeleteQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value: null });
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  whereNotNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: "IS NOT NULL",
  ): DeleteQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value: null });
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  toSql(): { sql: string; bindings: unknown[] } {
    const { clause, bindings } = this._buildWhereClause(this._conditions);

    const sql = `DELETE FROM ${String(this._table)}${clause}`;
    return { sql, bindings };
  }
}
