export type Wheres = {
  columns: string;
  operator: string;
  value: unknown;
  connector: "AND" | "OR";
};

export type Statements = "SELECT" | "INSERT" | "UPDATE" | "DELETE";

export type Row = Record<string, string | number | boolean | null>;
