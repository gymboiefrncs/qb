import { SelectQuery } from "./lib/core.js";

const qb = new SelectQuery();

qb.select("name", "age")
  .from("users")
  .where("id", "=", 1)
  .where("id", "=", 1)
  .where("id", "=", 1)
  .orWhere("id", "=", 1);
console.log(qb.toSql());
