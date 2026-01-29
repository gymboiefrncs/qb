import type {
  PrimitiveTypes,
  Operators,
  Conditions,
} from "../../types/queries.js";

export class SelectQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
> {
  #columns: Array<keyof TTable[T] | "*"> | null = null;
  #table: T;
  #conditions: Conditions[] = [];

  constructor(table: T) {
    this.#table = table;
  }

  columns(...col: Array<keyof TTable[T] | "*">): this {
    this.#columns = col.length ? col : ["*"];
    return this;
  }

  andWhere<K extends keyof T>(
    column: K,
    operator: Operators,
    value: T[K],
  ): this {
    if (this.#conditions.length === 0) {
      throw new Error("Use where for the first condition");
    }
    this.#conditions.push({ column, operator, value, connector: "AND" });
    return this;
  }

  orWhere<K extends keyof T>(
    column: K,
    operator: Operators,
    value: T[K],
  ): this {
    if (this.#conditions.length === 0) {
      throw new Error("Use where for the first condition");
    }
    this.#conditions.push({ column, operator, value, connector: "OR" });
    return this;
  }

  where<K extends keyof T>(column: K, operator: Operators, value: T[K]): this {
    if (this.#conditions.length > 0) {
      throw new Error("Use andWhere/orWhere for additional conditions");
    }
    this.#conditions.push({ column, operator, value });
    return this;
  }

  /**
   * @internal For debugging only.
   * Use QueryExecutor instance.execute() in normal usage.
   *
   * @returns an object containing sql statement and bindings
   */
  toSql() {
    if (!this.#table) throw new Error("SelectQueryError: table not specified");
    if (!this.#columns)
      throw new Error("SelectQueryError: column not provided");

    let placeholder = 1;
    // if theres only one condition, dont add prefix. otherwise, add prefix
    const condition = this.#conditions
      .map((c, i) => {
        const prefix = i === 0 ? "" : ` ${c.connector}`;
        return `${prefix} ${c.column} ${c.operator} $${placeholder++}`;
      })
      .join("");

    const whereClause = condition ? ` WHERE${condition}` : "";

    const bindings = this.#conditions.map((c) => c.value);
    const sql = `SELECT ${this.#columns.join(", ")} FROM ${String(this.#table)}${whereClause}`;

    return { sql, bindings };
  }
}
