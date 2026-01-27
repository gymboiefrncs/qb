import { TO_SQL, type PrimitiveTypes } from "../../types/queries.js";

export class InsertQuery<T extends Record<string, PrimitiveTypes>> {
  #values: T[] = [];
  #table: string;
  #columns: Array<keyof T | "*"> | null = null;

  constructor(table: string) {
    this.#table = table;
  }

  values<K extends T[]>(...val: K): this {
    if (val.some((v) => !Object.keys(v).length))
      throw new Error(
        "InsertQueryError: values must have at least one property",
      );

    this.#values.push(...val);

    return this;
  }

  returning<K extends Array<keyof T | "*">>(...columns: K): this {
    this.#columns = columns.length ? columns : ["*"];
    return this;
  }

  /**
   * this function can only be used internally
   * @returns an object containing the sql statement and the bindings
   */
  [TO_SQL](): { sql: string; bindings: unknown[] } {
    if (!this.#table) throw new Error("InsertQueryError: table not specified");
    if (!this.#values.length)
      throw new Error("InsertQueryError: no values provided");

    const rows = this.#values;
    const bindings: unknown[] = [];

    // extract keys
    const allKeys = Array.from(
      new Set(rows.flatMap((k) => Object.keys(k) as Array<keyof T>)),
    );

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
    const sql = `INSERT INTO "${this.#table}" (${allKeys.join(", ")}) VALUES ${placeholderGroups.join(", ")} ${returning}`;

    return { sql, bindings };
  }
}
