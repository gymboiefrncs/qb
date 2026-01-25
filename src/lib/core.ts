import type { Wheres, Statements, Row } from "../types/queries.js";

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
        .map((condition: Wheres, index) => {
          const part = `${condition.columns} ${condition.operator} ${condition.value}`;

          if (index === 0) return part;

          return `${condition.connector} ${part}`;
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

  toSql(): string {
    const sql = `${this.#type} INTO ${this.#table} (${Object.keys(this.#value).join(", ")}) VALUES (${Object.values(
      this.#value,
    )
      .map((v) => {
        if (typeof v === "string") {
          return `'${v}'`;
        } else if (typeof v === "number") {
          return v;
        } else if (typeof v === "boolean") {
          return v ? "TRUE" : "False";
        } else if (v === null) {
          return "NULL";
        } else {
          return v;
        }
      })
      .join(", ")}) `;

    return sql;
  }
}
