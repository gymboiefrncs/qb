# TypeScript SQL Query Builder

A type-safe SQL query builder for PostgreSQL with support for SELECT, INSERT, UPDATE, and DELETE operations.

## Overview

This library provides a fluent, type-safe interface for constructing SQL queries in TypeScript. It supports:

- **SELECT** queries with column selection and WHERE conditions
- **INSERT** queries with multiple rows and RETURNING clauses
- **UPDATE** queries with SET operations and WHERE conditions
- **DELETE** queries with WHERE conditions

All operations are validated against your table schema at compile time.

---

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Core Classes](#core-classes)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)

---

## Installation & Setup

- Not published yet

### Define Your Schema

First, define your table schema for type safety:

```typescript
export type User = {
  id?: number;
  name: string;
  is_admin?: boolean;
  age: number | null;
};

export type TableMap = {
  users: User;
};
```

### Initialize QueryExecutor

```typescript
import { QueryExecutor } from "./lib/core/query-executor";
import { pool } from "./db";

const executor = new QueryExecutor(pool);
```

---

## Core Classes

### BaseQuery

Abstract base class providing common functionality for all query types.

**Responsibilities:**

- Manages WHERE conditions and their connectors (AND/OR)
- Stores selected/returned columns
- Provides common methods: `where()`, `andWhere()`, `orWhere()`, and `returning()`

**Protected Properties:**

- `_conditions`: Array of condition objects (column, operator, value, connector)
- `_columns`: Array of columns to return/select (or null)
- `_table`: The table being queried

---

### SelectQuery

Represents a SELECT query for retrieving data from a table.

**Key Methods:**

- `columns(...col)`: Specify which columns to select
- `where()`, `andWhere()`, `orWhere()`: Add WHERE conditions
- `toSql()`: Generate SQL string and bindings (internal use)

**Type Safety:**

- Column names are validated against the table schema
- Only allows valid column names and `"*"`

**Example:**

```typescript
const query = executor
  .select("users")
  .columns("id", "name", "age")
  .where("age", ">", 18)
  .andWhere("is_admin", "=", true);

const result = await executor.execute(query);
```

---

### InsertQuery

Represents an INSERT query for adding rows to a table.

**Key Methods:**

- `values(...val)`: Add one or more rows to insert
- `returning(...columns)`: Specify which columns to return after insert
- `toSql()`: Generate SQL string and bindings (internal use)

**Behavior:**

- Requires at least one row with at least one property
- Automatically handles columns missing from individual rows using `DEFAULT`
- Null values must be explicitly assigned

**Example:**

```typescript
const query = executor
  .insert("users")
  .values(
    { name: "Alice", age: 28, is_admin: true },
    { name: "Bob", age: 32 }, // is_admin will use DEFAULT
  )
  .returning("id", "name");

const result = await executor.execute(query);
```

**With null values:**

```typescript
const query = executor
  .insert("users")
  .values(
    { name: "Alice", age: 28, is_admin: true },
    { name: "Bob", age: null }, // is_admin will use DEFAULT, age will be NULL
  )
  .returning("id", "name");

const result = await executor.execute(query);
```

---

### UpdateQuery

Represents an UPDATE query for modifying existing rows.

**Inherits From:** `BaseQuery`

**Key Methods:**

- `set(updates)`: Define which columns to update and their new values
- `where()`, `andWhere()`, `orWhere()`: Specify which rows to update
- `returning(...columns)`: Specify columns to return after update

**Behavior:**

- Multiple `set()` calls are merged together

**Example:**

```typescript
const query = executor
  .update("users")
  .set({ age: 30, is_admin: false })
  .where("id", "=", 5)
  .returning("id", "name", "age");

const result = await executor.execute(query);
```

```typescript
const query = executor
  .update("users")
  .set({ age: 30, is_admin: false })
  .set({ age: 12 }) // overrides the first object's age
  .where("id", "=", 5)
  .returning("id", "name", "age");

const result = await executor.execute(query);
```

---

### DeleteQuery

Represents a DELETE query for removing rows from a table.

**Key Methods:**

- `where()`, `andWhere()`, `orWhere()`: Specify which rows to delete

**Behavior:**

- Simple row deletion with WHERE conditions

**Example:**

```typescript
const query = executor
  .delete("users")
  .where("id", "=", 10)
  .andWhere("is_admin", "=", false);

const result = await executor.execute(query);
```

---

### QueryExecutor

Main entry point for all query operations and database connection management.

**Key Methods:**

- `insert<T>(table: T)`: Create an InsertQuery
- `select<T>(table: T)`: Create a SelectQuery
- `update<T>(table: T)`: Create an UpdateQuery
- `delete<T>(table: T)`: Create a DeleteQuery
- `async execute(query)`: Execute a query and return results

**Example:**

```typescript
const executor = new QueryExecutor(pool);

const insertQuery = executor.insert("users").values({ name: "Alice", age: 28 });
const result = await executor.execute(insertQuery);
```

---

## API Reference

### `.where(column, operator, value)`

Add the first (required) WHERE condition.

**Parameters:**

- `column`: The column name (type-checked against table schema)
- `operator`: One of `">"`, `"<"`, `"="`, `"!="`
- `value`: The value to compare (type-checked)

**Behavior:**

- Must be called before `andWhere()` or `orWhere()`

**Example:**

```typescript
query.where("age", ">", 18);
```

---

### `.andWhere(column, operator, value)`

Add a WHERE condition joined with AND logic.

**Parameters:**

- `column`: The column name
- `operator`: One of `">"`, `"<"`, `"="`, `"!="`
- `value`: The value to compare

**Behavior:**

- Must be preceded by a `.where()` call
- Conditions are evaluated as: `WHERE condition1 AND condition2 AND ...`

**Example:**

```typescript
query
  .where("age", ">", 18)
  .andWhere("is_admin", "=", true)
  .andWhere("name", "!=", "Admin");
```

---

### `.orWhere(column, operator, value)`

Add a WHERE condition joined with OR logic.

**Parameters:**

- `column`: The column name
- `operator`: One of `">"`, `"<"`, `"="`, `"!="`
- `value`: The value to compare

**Behavior:**

- Must be preceded by a `.where()` call
- Mixes with AND conditions: `WHERE condition1 AND condition2 OR condition3 ...`

**Example:**

```typescript
query
  .where("age", ">", 18)
  .andWhere("is_admin", "=", true)
  .orWhere("status", "=", "special");
```

---

### `.set(updates)` (UpdateQuery only)

Specify which columns to update and their new values.

**Behavior:**

- Multiple `set()` calls are merged together

**Example:**

```typescript
query.set({ name: "John", age: 35 });
query.set({ name: "Johnny" }); // overrides the first object's name
```

---

### `.values(...val)` (InsertQuery only)

Specify row(s) to insert.

**Parameters:**

- `val`: One or more row objects matching the table schema

**Behavior:**

- Each row must have at least one property
- Missing columns use `DEFAULT` keyword in SQL
- Null must be explicitly assigned

**Example:**

```typescript
query.values(
  { id: 1, name: "Alice", age: 28 },
  { name: "Bob", age: 32 }, // id will use DEFAULT
);

// with null
query.values({ name: "Charlie", age: null });
```

---

### `.columns(...col)` (SelectQuery only)

Specify which columns to retrieve in a SELECT query.

**Parameters:**

- `col`: One or more column names, or `"*"` for all columns

**Behavior:**

- Defaults to `["*"]` if called without arguments

**Example:**

```typescript
query.columns("id", "name", "age");
// or
query.columns("*");
// or
query.columns(); // defaults to '*'
```

---

### `.returning(...columns)` (InsertQuery & UpdateQuery only)

Specify which columns to return after INSERT or UPDATE operations.

**Parameters:**

- `columns`: One or more column names, or `"*"` for all columns

**Behavior:**

- Optional for INSERT and UPDATE queries
- Defaults to `["*"]` if called without arguments

**Example:**

```typescript
query.returning("id", "name");
// or
query.returning("*");
// or
query.returning(); // defaults to '*'
```

---

## Usage Examples

### SELECT Examples

**Simple SELECT:**

```typescript
import { QueryExecutor } from "./lib/core/query-executor";
import { pool } from "./db";

const executor = new QueryExecutor(pool);

const query = executor
  .select("users")
  .columns("id", "name", "age")
  .where("age", ">", 18);

const results = await executor.execute(query);
console.log(results.rows);
```

**SELECT with multiple conditions:**

```typescript
const query = executor
  .select("users")
  .columns("*")
  .where("is_admin", "=", true)
  .andWhere("age", ">", 21)
  .orWhere("status", "=", "premium");

const filteredResults = await executor.execute(query);
console.log(filteredResults.rows);
```

---

### INSERT Examples

**Basic INSERT:**

```typescript
const query = executor
  .insert("users")
  .values(
    { name: "Alice Johnson", age: 28, is_admin: true },
    { name: "Bob Smith", age: 35, is_admin: false },
    { name: "Charlie Brown", age: 22 }, // is_admin uses DEFAULT
    { name: "Diana Lee", age: null }, // age is NULL
  )
  .returning("id", "name");

const insertedRows = await executor.execute(query);
console.log(insertedRows.rows);
```

---

### UPDATE Examples

**Basic UPDATE:**

```typescript
const query = executor
  .update("users")
  .set({ age: 30, is_admin: true })
  .where("id", "=", 5)
  .returning("id", "name", "age");

const updated = await executor.execute(query);
console.log(updated.rows);
```

**UPDATE with multiple conditions:**

```typescript
const query = executor
  .update("users")
  .set({ status: "inactive" })
  .where("age", ">", 65)
  .andWhere("is_admin", "=", false)
  .returning("id");

const deactivated = await executor.execute(query);
console.log(deactivated.rows);
```

---

### DELETE Examples

**Basic DELETE:**

```typescript
const query = executor.delete("users").where("id", "=", 10);

const result = await executor.execute(query);
```

**DELETE with multiple conditions:**

```typescript
const query = executor
  .delete("users")
  .where("is_admin", "=", false)
  .andWhere("age", "<", 18);

const result = await executor.execute(query);
```

---

## Notes

- **Type Safety**: All operations are validated against your schema at compile time
- **SQL Injection Protection**: Uses parameterized queries with pg placeholders
- **toSql()**: This method is used for debugging only
- **execute() method**: Invokes toSql() method internally and perform database operation
