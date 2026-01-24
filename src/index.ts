import { BuildQuery } from "./lib/core.js";

const qb = new BuildQuery();

qb.select("name", "age").from("users").where("id", "=", 1).where("id", "=", 1);
console.log(qb.toSql());
