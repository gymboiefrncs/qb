export type Operator = "=" | "!=" | ">" | "<" | ">=" | "<=";

export type Wheres<T, K extends keyof T> = {
  column: K & string;
  operator: Operator;
  value: T[K];
  connector: "AND" | "OR";
};

export type User = {
  id: number;
  name: string;
  is_admin: boolean;
};

export type UserWithoutID = Omit<User, "id">;

export type Statements = "SELECT" | "INSERT" | "UPDATE" | "DELETE";

export type PrimitiveTypes = string | number | boolean | null;

export type Row = Record<string, PrimitiveTypes>;

export const TO_SQL = Symbol("TO_SQL");
