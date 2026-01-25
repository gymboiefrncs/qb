import type { Wheres, Statements } from "../types/queries.js";

abstract class BaseBuilder {
  protected table: string | null = null;
  protected wheres: Wheres[] = [];

  from(table: string): this {
    this.table = table;
    return this;
  }

  where(columns: string, operator: string, value: unknown): this {
    return this.andOrWhere(columns, operator, value, "AND");
  }

  orWhere(columns: string, operator: string, value: unknown): this {
    return this.andOrWhere(columns, operator, value, "OR");
  }

  private andOrWhere(
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
  #columns: string[] = ["*"];

  select(...columns: string[]): this {
    this.#type = "SELECT";
    this.#columns = columns.length ? columns : ["*"];
    return this;
  }

  toSql(): string {
    let sql = `${this.#type} ${this.#columns.join(", ")} FROM ${this.table}`;
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
