# TypeScript SQL Query Builder - Documentation

## Overview

This is a TypeScript SQL query builder foor PostgreSQL, type-safe interface for constructing SQL queries. It supports SELECT, INSERT, UPDATE, and DELETE operations with support for WHERE conditions, value bindings, and column selection.

---

## Class Descriptions

### BaseQuery

**Purpose**: Abstract base class that provides common functionality for all query types.

**Generic Parameters**:

- `TTable`: A record type mapping table names to their schema objects
- `T`: A key of `TTable` representing the specific table being queried

**Responsibilities**:

- Manages WHERE conditions and their connectors (AND/OR)
- Stores selected/returned columns
- Provides common methods: `where()`, `andWhere()`, `orWhere()`, and `returning()`

**Protected Properties**:

- `_conditions`: Array of condition objects (column, operator, value, connector)
- `_columns`: Array of columns to return/select (or null)
- `_table`: The table being queried

---

### SelectQuery

**Purpose**: Represents a SELECT query for retrieving data from a table.

**Inherits From**: `BaseQuery`

**Responsibilities**:

- Specifies which columns to retrieve
- Builds SQL SELECT statements with WHERE conditions
- Generates type-safe column selection

**Key Methods**:

- `columns(...col)`: Specify which columns to select
- `where()`, `andWhere()`, `orWhere()`: Add WHERE conditions (inherited from BaseQuery)
- `toSql()`: Generate SQL string and bindings (internal use)

**Type Safety**:

- Column names are validated against the table schema
- Only allows valid column names and "\*"

**Example**:

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

**Purpose**: Represents an INSERT query for adding rows to a table.

**Inherits From**: `BaseQuery`

**Responsibilities**:

- Accepts one or multiple row objects for insertion
- Handles default column values
- Builds INSERT statements with RETURNING clause

**Key Methods**:

- `values(...val)`: Add one or more rows to insert
- `returning(...columns)`: Specify which columns to return after insert
- `toSql()`: Generate SQL string and bindings (internal use)

**Behavior**:

- Requires at least one row with at least one property
- Automatically handles columns missing from individual rows using `DEFAULT`

**Example**:

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

For null values, you should explicitly assign it

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

**Purpose**: Represents an UPDATE query for modifying existing rows.

**Inherits From**: `BaseQuery`

**Responsibilities**:

- Specifies which columns to update and their new values
- Applies WHERE conditions to target specific rows
- Returns updated rows if specified

**Key Methods**:

- `set(updates)`: Define which columns to update and their new values
- `where()`, `andWhere()`, `orWhere()`: Specify which rows to update
- `returning(...columns)`: Specify columns to return after update

**Behavior**:

- Requires at least one WHERE condition to prevent unintended updates
- Merges multiple `set()` calls together
- Can be chained with multiple conditions

**Example**:

```typescript
const query = executor
  .update("users")
  .set({ age: 30, is_admin: false })
  .where("id", "=", 5)
  .returning("id", "name", "age");

const result = await executor.execute(query);
```

---

### DeleteQuery

**Purpose**: Represents a DELETE query for removing rows from a table.

**Inherits From**: `BaseQuery`

**Responsibilities**:

- Specifies which rows to delete via WHERE conditions
- Builds DELETE statements
- Does not support value insertion or column selection

**Key Methods**:

- `where()`, `andWhere()`, `orWhere()`: Specify which rows to delete

**Behavior**:

- Simple row deletion

**Example**:

```typescript
const query = executor
  .delete("users")
  .where("id", "=", 10)
  .andWhere("is_admin", "=", false);

const result = await executor.execute(query);
```

**NOTE**: No protection against `DELETE` without WHERE conditions; use with caution.

---

### QueryExecutor

**Purpose**: Main entry point for all query operations; manages database connections and query execution.

**Responsibilities**:

- Creates query instances (insert, select, update, delete)
- Executes built queries against the database
- Manages PostgreSQL connection pool

**Methods**:

- `insert<T>(table: T)`: Create an InsertQuery for the specified table
- `select<T>(table: T)`: Create a SelectQuery for the specified table
- `update<T>(table: T)`: Create an UpdateQuery for the specified table
- `delete<T>(table: T)`: Create a DeleteQuery for the specified table
- `async execute(query)`: Execute a query and return results

**Example**:

```typescript
const executor = new QueryExecutor(pool);

const insertQuery = executor.insert("users").values({ name: "Alice", age: 28 });
const result = await executor.execute(insertQuery);
```

---

## Methods Reference

### `.where(column, operator, value)`

**Purpose**: Add the first (required) WHERE condition to a query.

**Parameters**:

- `column`: The column name (type-checked against table schema)
- `operator`: One of `">"`, `"<"`, `"="`, `"!="`
- `value`: The value to compare against (type-checked)

**Behavior**:

- Must be called before `andWhere()` or `orWhere()`

**Example**:

```typescript
query.where("age", ">", 18);
```

---

### `.andWhere(column, operator, value)`

**Purpose**: Add an additional WHERE condition joined with AND logic.

**Parameters**:

- `column`: The column name
- `operator`: One of `">"`, `"<"`, `"="`, `"!="`
- `value`: The value to compare against

**Behavior**:

- Must be preceded by a `.where()` call
- Conditions are evaluated as: `WHERE condition1 AND condition2 AND ...`

**Example**:

```typescript
query
  .where("age", ">", 18)
  .andWhere("is_admin", "=", true)
  .andWhere("name", "!=", "Admin");
```

---

### `.orWhere(column, operator, value)`

**Purpose**: Add an additional WHERE condition joined with OR logic.

**Parameters**:

- `column`: The column name
- `operator`: One of `">"`, `"<"`, `"="`, `"!="`
- `value`: The value to compare against

**Behavior**:

- Must be preceded by a `.where()` call
- Mixes with AND conditions: `WHERE condition1 AND condition2 OR condition3 ...`

**Example**:

```typescript
query
  .where("age", ">", 18)
  .andWhere("is_admin", "=", true)
  .orWhere("status", "=", "special");
```

---

### `.set(updates)`

**Purpose**: Specify which columns to update and their new values (UpdateQuery only).

**Parameters**:

- `updates`: A partial object containing columns to update with their new values
  - Type: `Partial<TTable[T]>`
  - Example: `{ age: 30, is_admin: false }`

**Behavior**:

- Multiple `set()` calls will merge their updates
- Must be called on UpdateQuery instances only

**Example**:

```typescript
query.set({ name: "John", age: 35 });
```

---

### `.values(...val)`

**Purpose**: Specify row(s) to insert (InsertQuery only).

**Parameters**:

- `val`: One or more row objects matching the table schema
  - Type: `TTable[T][]`

**Behavior**:

- Each row must have at least one property
- Missing columns in a row will use `DEFAULT` keyword in SQL
- Null must be explicitly assigned
- Can be called multiple times to add more rows
- Can accept variable number of arguments or arrays

**Example**:

```typescript
query.values(
  { id: 1, name: "Alice", age: 28 },
  { name: "Bob", age: 32 }, // id will use DEFAULT
);

// with null
query.values({ name: "Charlie", age: null });
```

---

### `.columns(...col)`

**Purpose**: Specify which columns to retrieve in a SELECT query.

**Parameters**:

- `col`: One or more column names, or `"*"` for all columns

**Behavior**:

- If no arguments provided, defaults to `["*"]`

**Example**:

```typescript
query.columns("id", "name", "age");
// or
query.columns("*");
// or
query.columns(); // defaults to '*'
```

---

### `.returning(...columns)`

**Purpose**: Specify which columns to return after INSERT or UPDATE operations.

**Parameters**:

- `columns`: One or more column names, or `"*"` for all columns

**Behavior**:

- Optional for INSERT and UPDATE queries
- Defaults to `["*"]` if called without arguments

**Example**:

```typescript
query.returning("id", "name");
// or
query.returning("*");
// or
query.returning(); // defaults to '*'
```

---

## Usage Examples

Must define a schema first for type safety

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

### Complete SELECT Example

```typescript
import { QueryExecutor } from "./lib/core/query-executor";
import { pool } from "./db";

const executor = new QueryExecutor(pool);

// Simple SELECT
const query1 = executor
  .select("users")
  .columns("id", "name", "age")
  .where("age", ">", 18);

const results = await executor.execute(query1);
console.log(results.rows);

// SELECT with multiple conditions
const query2 = executor
  .select("users")
  .columns("*")
  .where("is_admin", "=", true)
  .andWhere("age", ">", 21)
  .orWhere("status", "=", "premium");

const filteredResults = await executor.execute(query2);
console.log(filteredResults.rows);
```

### Complete INSERT Example

```typescript
const query = executor
  .insert("users")
  .values(
    { name: "Alice Johnson", age: 28, is_admin: true },
    { name: "Bob Smith", age: 35, is_admin: false },
    { name: "Charlie Brown", age: 22 }, // is_admin uses DEFAULT
    { name: "Charlie Brown", age: null }, // age is NULL
  )
  .returning("id", "name");

const insertedRows = await executor.execute(query);
console.log(insertedRows.rows);
```

### Complete UPDATE Example

```typescript
const query = executor
  .update("users")
  .set({ age: 30, is_admin: true })
  .where("id", "=", 5)
  .returning("id", "name", "age");

const updated = await executor.execute(query);
console.log(updated.rows);

// Multiple conditions
const query2 = executor
  .update("users")
  .set({ status: "inactive" })
  .where("age", ">", 65)
  .andWhere("is_admin", "=", false)
  .returning("id");

const deactivated = await executor.execute(query2);
console.log(deactivated.rows);
```

### Complete DELETE Example

```typescript
const query = executor.delete("users").where("id", "=", 10);

const result = await executor.execute(query);

// Multiple conditions
const query2 = executor
  .delete("users")
  .where("is_admin", "=", false)
  .andWhere("age", "<", 18);

const result2 = await executor.execute(query2);
```

---
