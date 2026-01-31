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

  /** @internal - Use typed wrapper in subclass */
  protected _andWhere<K extends keyof TTable[T]>(
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): void {
    this._conditions.push({ column, operator, value, connector: "AND" });
  }

  /** @internal - Use typed wrapper in subclass */
  protected _orWhere<K extends keyof TTable[T]>(
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): void {
    this._conditions.push({ column, operator, value, connector: "OR" });
  }

  /** @internal - Use typed wrapper in subclass */
  protected _where<K extends keyof TTable[T]>(
    column: K,
    operator: Operators,
    value: TTable[T][K],
  ): void {
    this._conditions.push({ column, operator, value });
  }

  returning(...columns: Array<keyof TTable[T] | "*">): this {
    this._columns = columns.length ? columns : ["*"];
    return this;
  }
}
