export type User = {
  id?: number;
  name: string;
  is_admin?: boolean;
  age: number | null;
};

export type Post = {
  postId: number;
  userId: number;
  content: string;
};

export type TableMap = {
  users: User;
  posts: Post;
};

// Lib types
export type Conditions = {
  column: unknown;
  operator: StringOperators | Operators;
  value: unknown;
  connector?: Connector;
};

export type ExecutableQuery = { toSql(): { sql: string; bindings: unknown[] } };

export type ValidOperators<T> = T extends string
  ? Operators | StringOperators
  : Operators;

export type NullOperators = "IS NULL" | "IS NOT NULL";

type Operators =
  | ">"
  | "<"
  | "="
  | "!="
  | "<="
  | ">="
  | "IS NULL"
  | "IS NOT NULL";

type StringOperators =
  | "LIKE"
  | "NOT LIKE"
  | "ILIKE"
  | "NOT ILIKE"
  | "IN"
  | "NOT IN";

export type Connector = "AND" | "OR";

export type PrimitiveTypes = string | number | boolean | null;

export type NoWhere = { _hasWhere: false };

export type HasWhere = { _hasWhere: true };
