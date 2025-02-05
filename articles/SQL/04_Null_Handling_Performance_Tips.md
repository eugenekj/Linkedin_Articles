---
title: "Mastering SQL Techniques: NULL Handling, Deduplication, Pagination, and Special Keywords"
author: "Eugene Koshy"
layout: post
description: "An advanced guide to SQL techniques for handling NULL values, deduplication, pagination, and vendor-specific optimizations."
tags: [SQL, DatabaseOptimization, DataEngineering, Performance]
---

# Mastering SQL Techniques: NULL Handling, Deduplication, Pagination, and Special Keywords

## 📌 Table of Contents
- [Introduction](#introduction)
- [1. Handling NULL Values](#1-handling-null-values)
  - [Why NULL Handling Matters](#why-null-handling-matters)
  - [Core Functions and Operators](#core-functions-and-operators)
  - [Handling NULLs in Aggregations](#handling-nulls-in-aggregations)
  - [Advanced Techniques](#advanced-techniques)
- [2. DISTINCT Keyword](#2-distinct-keyword)
  - [When to Use DISTINCT](#when-to-use-distinct)
  - [DISTINCT vs. GROUP BY](#distinct-vs-group-by)
  - [PostgreSQL’s DISTINCT ON](#postgresqls-distinct-on)
- [3. LIMIT and OFFSET for Pagination](#3-limit-and-offset-for-pagination)
  - [The Problem with OFFSET](#the-problem-with-offset)
  - [Keyset Pagination (Seek Method)](#keyset-pagination-seek-method)
- [4. Special SQL Keywords by Database](#4-special-sql-keywords-by-database)
  - [PostgreSQL: RETURNING](#postgresql-returning)
  - [Oracle: MERGE](#oracle-merge)
  - [MySQL: ON DUPLICATE KEY UPDATE](#mysql-on-duplicate-key-update)
  - [Common Table Expressions (CTEs)](#common-table-expressions-ctes)
- [Conclusion and Best Practices](#conclusion-and-best-practices)

---

## 🛠 Introduction
SQL is the backbone of relational databases, but mastering its nuances is critical for performance and accuracy. This guide covers four essential areas—NULL handling, deduplication, pagination, and vendor-specific keywords—with real-world scenarios and best practices.

---

## 1️⃣ Handling NULL Values  
NULL values represent missing or undefined data, which can lead to incorrect calculations, skewed reports, or even application crashes.

### 🔹 Why NULL Handling Matters
- **Data Integrity**: NULLs can break arithmetic operations (e.g., `SUM`, `AVG`).
- **Query Accuracy**: `WHERE column = NULL` does not work (use `IS NULL`).
- **Performance**: Indexes may exclude NULLs, affecting query plans.

### 🔹 Core Functions and Operators
#### **`COALESCE()`** – Returns the first non-NULL value
```sql
SELECT COALESCE(employee_name, 'Unknown') AS name FROM employees;
```
#### **`IS NULL` vs. `= NULL`** – Correct way to check for NULL
```sql
SELECT * FROM orders WHERE discount IS NULL;  -- ✅ Correct way
```

#### **Database-Specific NULL Functions**
- **MySQL**: `IFNULL()`
  ```sql
  SELECT IFNULL(salary, 0) FROM employees;
  ```
- **Oracle**: `NVL()`
  ```sql
  SELECT NVL(address, 'Not Provided') FROM customers;
  ```
- **PostgreSQL**: `NULLIF()`
  ```sql
  SELECT AVG(NULLIF(revenue, 0)) FROM sales;
  ```

### 🔹 Handling NULLs in Aggregations
```sql
SELECT COUNT(*), COUNT(salary) FROM employees;
```
- `COUNT(*)` includes NULLs
- `COUNT(salary)` ignores NULLs

---

## 2️⃣ DISTINCT Keyword
The `DISTINCT` keyword removes duplicate rows but can be inefficient for large datasets.

### 🔹 DISTINCT vs. GROUP BY
```sql
SELECT city FROM users GROUP BY city;  -- Often faster with indexes
```

### 🔹 PostgreSQL’s `DISTINCT ON`
```sql
SELECT DISTINCT ON (customer_id) customer_id, order_date FROM orders ORDER BY customer_id, order_date DESC;
```

---

## 3️⃣ LIMIT and OFFSET for Pagination
### 🔹 The Problem with OFFSET
Using `OFFSET 10000` forces the database to scan and discard 10,000 rows, slowing queries.

### 🔹 Keyset Pagination (Seek Method) – Faster Alternative
```sql
SELECT * FROM employees WHERE id > 100 ORDER BY id LIMIT 10;
```

| **Metric**         | `LIMIT/OFFSET` | **Keyset**   |
|-------------------|---------------|-------------|
| **Speed**        | Slower         | Faster      |
| **Scalability**  | Poor           | Excellent   |

---

## 4️⃣ Special SQL Keywords by Database
### 🔹 PostgreSQL: `RETURNING`
```sql
INSERT INTO logs (message, severity) VALUES ('Login failed', 'HIGH') RETURNING log_id, created_at;
```

### 🔹 Oracle: `MERGE`
```sql
MERGE INTO inventory_target t USING inventory_source s ON (t.product_id = s.product_id)
WHEN MATCHED THEN UPDATE SET t.stock = t.stock + s.restock
WHEN NOT MATCHED THEN INSERT (product_id, stock) VALUES (s.product_id, s.restock);
```

### 🔹 MySQL: `ON DUPLICATE KEY UPDATE`
```sql
INSERT INTO users (email, last_login) VALUES ('alice@example.com', NOW())
ON DUPLICATE KEY UPDATE last_login = NOW();
```

### 🔹 Common Table Expressions (CTEs)
```sql
WITH RECURSIVE org_chart AS (
  SELECT id, name, manager_id FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id FROM employees e
  JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT * FROM org_chart;
```

---

## ✅ Conclusion and Best Practices
### **NULL Handling**
✔ Use `COALESCE` for defaults, `NULLIF` to exclude values.
❌ Avoid `WHERE column = NULL`; use `IS NULL` instead.

### **Deduplication**
✔ Prefer `GROUP BY` over `DISTINCT` for large datasets.
❌ Don’t overuse `DISTINCT` without query optimization.

### **Pagination**
✔ Use Keyset Pagination for scalable results.
❌ Avoid `OFFSET` for tables with >10k rows.

### **Vendor-Specific Optimizations**
✔ PostgreSQL’s `RETURNING` for auditing.
✔ Oracle’s `MERGE` for upserts.
✔ MySQL’s `ON DUPLICATE KEY UPDATE` for simplicity.


---

#SQL #DatabaseOptimization #DataEngineering #TechTips #PostgreSQL #DataAnalysis #SoftwareEngineering
