export type User = {
  id?: number;
  name: string;
  is_admin?: boolean;
  age: number | null;
};

export type Conditions = {
  column: unknown;
  operator: Operators;
  value: unknown;
  connector?: Connector;
};

export type Operators = ">" | "<" | "=" | "!=";

export type Connector = "AND" | "OR";

export type PrimitiveTypes = string | number | boolean | null;

export const INSERT_TO_SQL = Symbol("INSERT");
export const SELECT_TO_SQL = Symbol("SELECT");
