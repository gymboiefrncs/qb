import type { Pool, QueryResult } from "pg";
import {
  type Wheres,
  type Statements,
  type Row,
  type Operator,
  TO_SQL,
  type PrimitiveTypes,
} from "../types/queries.js";

abstract class BaseBuilder<T> {
  protected table: string | null = null;
  protected wheres: Wheres<T, keyof T & string>[] = [];
  protected columns: Array<keyof T | "*"> = [];

  from(table: string): this {
    this.table = table;
    return this;
  }

  where<K extends keyof T & string>(
    columns: K,
    operator: Operator,
    value: T[K],
  ): this {
    return this.#andOrWhere(columns, operator, value, "AND");
  }

  orWhere<K extends keyof T & string>(
    columns: K,
    operator: Operator,
    value: T[K],
  ): this {
    return this.#andOrWhere(columns, operator, value, "OR");
  }

  #andOrWhere<K extends keyof T & string>(
    column: K,
    operator: Operator,
    value: T[K],
    connector: "AND" | "OR",
  ) {
    this.wheres.push({ column, operator, value, connector });
    return this;
  }
}

export class SelectQuery<T extends Row> extends BaseBuilder<T> {
  #type: Statements = "SELECT";

  select(...columns: Array<keyof T | "*">): this {
    this.columns = columns.length ? columns : ["*"];
    return this;
  }

  toSql(): { sql: string; bindings: Array<T[keyof T]> } {
    let sql = `${this.#type} ${this.columns.join(", ")} FROM ${this.table}`;

    const bindings: Array<T[keyof T]> = [];

    if (this.wheres.length > 0) {
      sql += ` WHERE ${this.wheres
        .map((c, i) => {
          bindings.push(c.value);
          const part = `${c.column} ${c.operator} $${i + 1}`;

          // if only one condition return immediately
          if (i === 0) return part;

          // other wise add connector
          return `${c.connector} ${part}`;
          //          ^?
        })
        .join(" ")}`;
    }
    return { sql, bindings };
  }
}

export class InsertQuery<T extends Row> extends BaseBuilder<T> {
  #type: Statements = "INSERT";
  #value: T[] = [];
  #table: string | null = null;

  insert(table: string): this {
    if (!table || table.trim() === "")
      throw new Error("InsertQueryError: table must be a non-empty string");
    this.#table = table;
    return this;
  }

  value(...val: T[]): this {
    if (val.some((v) => !Object.keys(v).length))
      throw new Error(
        "InsertQueryError: values must have at least one property",
      );

    this.#value.push(...val);

    return this;
  }

  returning(...columns: Array<keyof T | "*">): this {
    this.columns = columns.length ? columns : ["*"];
    return this;
  }

  // this function can only be used internally
  [TO_SQL](): { sql: string; bindings: PrimitiveTypes[] } {
    if (!this.#table) throw new Error("InsertQueryError: table not specified");
    const row = this.#value[0];
    if (!row) throw new Error("InsertQueryError: no values provided");
    const keys = Object.keys(row);
    const values = this.#value.flatMap((v) => Object.values(v));

    // TODO: check for missing columns or excess columns

    let i = 1;
    const placeholders = this.#value.map(() => {
      const count = keys.length;

      // generate placeholders based on the number of columns
      const placeholders = Array.from({ length: count }, () => `$${i++}`);
      return `(${placeholders.join(", ")})`;
    });

    const returning = this.columns.length
      ? `RETURNING ${this.columns.join(", ")} `
      : "";

    const sql = `${this.#type} INTO ${this.#table} (${keys.join(", ")}) VALUES ${placeholders.join(", ")} ${returning}`;
    return { sql, bindings: values };
  }
}

export class QueryExecutor {
  #db: Pool;
  constructor(db: Pool) {
    this.#db = db;
  }

  async insert<T extends Row>(query: InsertQuery<T>): Promise<QueryResult<T>> {
    const { sql, bindings } = query[TO_SQL]();
    console.log(sql, bindings);
    return await this.#db.query<T>(sql, bindings);
  }

  async select<T extends Row>(query: SelectQuery<T>): Promise<QueryResult<T>> {
    const { sql, bindings } = query.toSql();
    console.log(sql, bindings.length ? bindings : "");
    return await this.#db.query<T>(sql, bindings);
  }
}
