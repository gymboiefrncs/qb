import { InsertQuery, SelectQuery } from "./lib/core.js";

const qb = new SelectQuery();

qb.select("name", "age").from("users").where("id", "=", 1);

console.log(qb.toSql());

const insert = new InsertQuery();

insert.insert("table").value({ id: 1, name: "sample", isActive: true });
console.log(insert.toSql());
