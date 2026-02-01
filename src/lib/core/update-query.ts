import type {
  PrimitiveTypes,
  HasWhere,
  ValidOperators,
} from "../../types/queries.js";
import { BaseQuery } from "./base-query.js";

export class UpdateQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
  State extends { _hasWhere: boolean },
> extends BaseQuery<TTable, T> {
  #updates: Partial<TTable[T]> = {};

  set(updates: Partial<TTable[T]>): this {
    this.#updates = { ...this.#updates, ...updates };
    return this;
  }

  where<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): UpdateQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value });
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
  }

  andWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): UpdateQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value, connector: "AND" });
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
  }

  orWhere<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: ValidOperators<TTable[T][K]>,
    value: TTable[T][K],
  ): UpdateQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value, connector: "OR" });
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
  }

  andWhereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: "IS NULL",
  ): UpdateQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value: null, connector: "AND" });
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
  }

  orWhereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends true ? this : never,
    column: K,
    operator: "IS NULL",
  ): UpdateQuery<TTable, T, HasWhere> {
    this._conditions.push({ column, operator, value: null, connector: "OR" });
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
  }

  whereNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: "IS NULL",
  ) {
    this._conditions.push({ column, operator, value: null });
    return this as unknown as UpdateQuery<TTable, T, HasWhere>;
  }

  whereNotNull<K extends keyof TTable[T]>(
    this: State["_hasWhere"] extends false ? this : never,
    column: K,
    operator: "IS NOT NULL",
  ) {
    this._conditions.push({ column, operator, value: null });
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
    const updateBindings: unknown[] = [];
    const setClause: unknown[] = [];

    // generate setClause
    for (const key in this.#updates) {
      updateBindings.push(this.#updates[key]);
      setClause.push(`${key} = $${placeholder++}`);
    }
    const { clause, bindings } = this._buildWhereClause(
      this._conditions,
      placeholder,
    );
    const returning = this._columns
      ? `RETURNING ${this._columns.join(", ")}`
      : "";

    const sql = `UPDATE ${String(this._table)} SET ${setClause.join(", ")}${clause} ${returning}`;

    return { sql, bindings: [...updateBindings, ...bindings] };
  }
}
