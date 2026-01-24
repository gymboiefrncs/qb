import type { Wheres, Statements } from "../types/queries.js";

export class BuildQuery {
  private _type: Statements;
  private _columns: string[];
  private _table: string | null;
  private _wheres: Wheres[];

  constructor() {
    this._type = "SELECT";
    this._columns = ["*"];
    this._table = null;
    this._wheres = [];
  }

  select(...columns: string[]): this {
    this._type = "SELECT";
    this._columns = columns.length ? columns : ["*"];
    return this;
  }

  from(table: string): this {
    this._table = table;
    return this;
  }

  where(columns: string, operator: string, value: unknown): this {
    return this.andOrWhere(columns, operator, value, "AND");
  }

  orWhere(columns: string, operator: string, value: unknown): this {
    return this.andOrWhere(columns, operator, value, "OR");
  }

  andOrWhere(
    columns: string,
    operator: string,
    value: unknown,
    connector: "AND" | "OR",
  ) {
    this._wheres.push({ columns, operator, value, connector });
    return this;
  }

  toSql(): string {
    let sql = `${this._type} ${this._columns.join(", ")} FROM ${this._table}`;
    if (this._wheres.length > 0) {
      sql += ` WHERE ${this._wheres
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
