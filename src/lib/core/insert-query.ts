import type { PrimitiveTypes } from "../../types/queries.js";

export class InsertQuery<
  TTable extends Record<string, Record<string, PrimitiveTypes>>,
  T extends keyof TTable,
> {
  #values: TTable[T][] = [];
  #table: T;
  #columns: Array<keyof TTable[T] | "*"> | null = null;

  constructor(table: T) {
    this.#table = table;
  }

  values(...val: TTable[T][]): this {
    if (val.some((v) => !Object.keys(v).length))
      throw new Error(
        "InsertQueryError: values must have at least one property",
      );

    this.#values.push(...val);

    return this;
  }

  returning(...columns: Array<keyof TTable[T] | "*">): this {
    this.#columns = columns.length ? columns : ["*"];
    return this;
  }

  /**
   * @internal For debugging only.
   * Use QueryExecutor instance.execute() in normal usage.
   *
   * @returns an object containing sql statement and bindings
   */
  toSql(): { sql: string; bindings: unknown[] } {
    if (!this.#table) throw new Error("InsertQueryError: table not specified");
    if (!this.#values.length)
      throw new Error("InsertQueryError: no values provided");

    const rows = this.#values;
    const bindings: unknown[] = [];

    // extract keys
    const allKeys = Array.from(new Set(rows.flatMap((k) => Object.keys(k))));

    let i = 1;
    /**
     * generates the positional parameters of the sql query
     *
     * iterates through all possible keys.
     * if a value is missing, it binds 'DEFAULT' otherwise,
     * it pushed the value to the 'bindings' array  and returns a positional parameters
     */
    const placeholderGroups = rows.map((row) => {
      const placeholders = allKeys.map((key) => {
        if (row[key] === undefined) {
          return "DEFAULT";
        } else {
          bindings.push(row[key]);
          return `$${i++}`;
        }
      });
      return `(${placeholders.join(", ")})`;
    });

    const returning = this.#columns
      ? `RETURNING ${this.#columns.join(", ")} `
      : "";

    // build the sql statement
    const sql = `INSERT INTO ${String(this.#table)} (${allKeys.join(", ")}) VALUES ${placeholderGroups.join(", ")} ${returning}`;

    return { sql, bindings };
  }
}
