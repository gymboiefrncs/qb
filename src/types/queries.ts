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

export type Conditions = {
  column: unknown;
  operator: Operators;
  value: unknown;
  connector?: Connector;
};

export type ExecutableQuery = { toSql(): { sql: string; bindings: unknown[] } };

export type Operators = ">" | "<" | "=" | "!=";

export type Connector = "AND" | "OR";

export type PrimitiveTypes = string | number | boolean | null;

export type NoWhere = { _hasWhere: false };

export type HasWhere = { _hasWhere: true };
