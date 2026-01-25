import type { Pool } from "pg";
import type { Wheres, Statements, Row } from "../types/queries.js";

// TODO: make it more typesafe

abstract class BaseBuilder {
  protected table: string | null = null;
  protected wheres: Wheres[] = [];
  protected columns: string[] = [];

  from(table: string): this {
    this.table = table;
    return this;
  }

  where(columns: string, operator: string, value: unknown): this {
    return this.#andOrWhere(columns, operator, value, "AND");
  }

  orWhere(columns: string, operator: string, value: unknown): this {
    return this.#andOrWhere(columns, operator, value, "OR");
  }

  #andOrWhere(
    columns: string,
    operator: string,
    value: unknown,
    connector: "AND" | "OR",
  ) {
    this.wheres.push({ columns, operator, value, connector });
    return this;
  }
}

export class SelectQuery extends BaseBuilder {
  #type: Statements = "SELECT";

  select(...columns: string[]): this {
    this.columns = columns.length ? columns : ["*"];
    return this;
  }

  toSql(): string {
    let sql = `${this.#type} ${this.columns.join(", ")} FROM ${this.table}`;
    if (this.wheres.length > 0) {
      sql += ` WHERE ${this.wheres
        .map((c, i) => {
          const part = `${c.columns} ${c.operator} $${i + 1}`;

          // if only one condition return immediately
          if (i === 0) return part;

          // other wise add connector
          return `${c.connector} ${part}`;
          //          ^?
        })
        .join(" ")}`;
    }
    return sql;
  }
}

export class InsertQuery extends BaseBuilder {
  #type: Statements = "INSERT";
  #value: Row = {};
  #table: string | null = null;

  insert(table: string): this {
    this.#table = table;
    return this;
  }

  value(val: Row): this {
    console.log(val);
    this.#value = val;
    return this;
  }

  toSql(): { sql: string; bindings: Row[string][] } {
    const keys = Object.keys(this.#value).join(", ");
    const values = Object.values(this.#value);

    const placeholders = values.map((_, i) => {
      return `$${i + 1}`;
    });

    const sql = `${this.#type} INTO ${this.#table} (${keys}) VALUES (${placeholders.join(", ")})`;

    return { sql, bindings: values };
  }
}

export class QueryExecutor {
  #db: Pool;
  constructor(db: Pool) {
    this.#db = db;
  }

  async run(sql: string, bindings?: Row[string][]) {
    return await this.#db.query(sql, bindings);
  }
}
