import type {
  PrimitiveTypes,
  Operators,
  Conditions,
} from "../../types/queries.js";

export abstract class BaseQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
> {
  protected _conditions: Conditions[] = [];
  protected _columns: Array<keyof TTable[T] | "*"> | null = null;
  protected _table: T;

  constructor(table: T) {
    this._table = table;
  }

  andWhere<K extends keyof T>(
    column: K,
    operator: Operators,
    value: T[K],
  ): this {
    if (this._conditions.length === 0) {
      throw new Error("Use where for the first condition");
    }
    this._conditions.push({ column, operator, value, connector: "AND" });
    return this;
  }

  orWhere<K extends keyof T>(
    column: K,
    operator: Operators,
    value: T[K],
  ): this {
    if (this._conditions.length === 0) {
      throw new Error("Use where for the first condition");
    }
    this._conditions.push({ column, operator, value, connector: "OR" });
    return this;
  }

  where<K extends keyof T>(column: K, operator: Operators, value: T[K]): this {
    if (this._conditions.length > 0) {
      throw new Error("Use andWhere/orWhere for additional conditions");
    }
    this._conditions.push({ column, operator, value });
    return this;
  }
}
