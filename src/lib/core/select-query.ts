import {
  type PrimitiveTypes,
  type Operators,
  SELECT_TO_SQL,
  type Conditions,
} from "../../types/queries.js";

export class SelectQuery<T extends Record<string, PrimitiveTypes>> {
  #columns: Array<keyof T | "*"> | null = null;
  #table: string;
  #conditions: Conditions[] = [];

  constructor(table: string) {
    this.#table = table;
  }

  columns<K extends Array<keyof T | "*">>(...col: K): this {
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

  [SELECT_TO_SQL]() {
    if (!this.#table) throw new Error("SelectQueryError: table not specified");
    if (!this.#columns)
      throw new Error("SelectQueryError: column not provided");
    if (!this.#conditions.length)
      throw new Error("SelectQueryError: no condition provided");

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
    const sql = `SELECT ${this.#columns.join(", ")} FROM ${this.#table}${whereClause}`;

    return { sql, bindings };
  }
}
