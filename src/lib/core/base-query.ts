import type {
  PrimitiveTypes,
  Conditions,
  NullOperators,
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

  /** @internal */
  protected _buildWhereClause(
    conditions: Conditions[],
    startingPlaceholder: number = 1,
  ) {
    const bindings: unknown[] = [];
    const condition = conditions
      .map((c, i) => {
        const prefix = i === 0 ? " WHERE" : ` ${c.connector}`;
        const nullOperators: NullOperators[] = ["IS NULL", "IS NOT NULL"];

        if (nullOperators.includes(c.operator as NullOperators)) {
          return `${prefix} ${c.column} ${c.operator}`;
        }
        bindings.push(c.value);
        return `${prefix} ${c.column} ${c.operator} $${startingPlaceholder++}`;
      })
      .join("");

    return { clause: condition, bindings };
  }

  returning(...columns: Array<keyof TTable[T] | "*">): this {
    this._columns = columns.length ? columns : ["*"];
    return this;
  }
}
