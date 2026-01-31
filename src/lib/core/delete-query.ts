import type {
  Operators,
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
    operator: Operators,
    value: TTable[T][K],
  ): DeleteQuery<TTable, T, HasWhere> {
    this._where(column, operator, value);
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  andWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): DeleteQuery<TTable, T, HasWhere> {
    this._andWhere(column, operator, value);
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

  orWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): DeleteQuery<TTable, T, HasWhere> {
    this._orWhere(column, operator, value);
    return this as unknown as DeleteQuery<TTable, T, HasWhere>;
  }

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
