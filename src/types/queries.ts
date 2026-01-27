export type User = {
  id?: number;
  name: string;
  is_admin?: boolean;
  age: number | null;
};

type Post = {
  id: number;
  title: string;
  content: string;
};

type Comments = {
  id: number;
  postId: number;
  content: string;
};

export type TableMap = {
  users: User;
  posts: Post;
  comments: Comments;
};

export type InsertTable<T extends keyof TableMap> = Omit<TableMap[T], "id">;

export type PrimitiveTypes = string | number | boolean | null;

export const TO_SQL = Symbol("TO_SQL");
