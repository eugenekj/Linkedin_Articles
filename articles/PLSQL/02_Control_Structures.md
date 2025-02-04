# Control Structures in PL/SQL—Mastering IF, CASE, and Loops

Control structures enable developers to dictate the flow of execution in a program. They form the core of logic building, allowing decisions, repetitive tasks, and conditional executions to be seamlessly handled. In this article, we dive into PL/SQL control structures in-depth, with practical examples, performance tips, and best practices to help you code efficiently.

## 1. Introduction to Control Structures

- **What are Control Structures?**  
These are constructs that control the flow of execution in a program based on conditions or repetitions.

- **Why are Control Structures Important?**  
They help in:
  - Making decisions based on conditions (e.g., IF or CASE).
  - Repeating a block of code (e.g., FOR, WHILE loops).
  - Directing the sequential flow of logic.

- **PL/SQL Categories:**
  - **Conditional Statements:** IF-THEN, CASE.
  - **Iterative Statements:** Loops (WHILE, FOR, Basic).
  - **Sequential Flow:** Regular flow of execution with EXIT and CONTINUE.

## 2. Conditional Statements in PL/SQL

### 2.1 IF-THEN-ELSE

The most fundamental control structure for making decisions.

- **Syntax:**

```plsql
IF condition THEN  
    -- Code block  
ELSIF another_condition THEN  
    -- Another code block  
ELSE  
    -- Fallback code block  
END IF;
```

- **Example 1: Validating User Input**

```plsql
DECLARE  
    input_age NUMBER := 25;  
BEGIN  
    IF input_age >= 18 THEN  
        DBMS_OUTPUT.PUT_LINE('Eligible to vote.');  
    ELSE  
        DBMS_OUTPUT.PUT_LINE('Not eligible to vote.');  
    END IF;  
END;
```

- **Example 2: Nested IF Statements**  
Used for multiple layers of decision-making.

```plsql
DECLARE  
    order_amount NUMBER := 1200;  
BEGIN  
    IF order_amount > 1000 THEN  
        IF order_amount > 5000 THEN 
            DBMS_OUTPUT.PUT_LINE('High-value customer.');  
        ELSE  
            DBMS_OUTPUT.PUT_LINE('Regular customer.');  
        END IF;  
    ELSE  
        DBMS_OUTPUT.PUT_LINE('Low-value customer.');  
    END IF;  
END;
```

- **Best Practice:**  
Avoid deeply nested IF statements for readability.

### 2.2 CASE Statement

A more structured alternative to multiple IF-THEN-ELSE statements.

- **Types of CASE Statements:**
  - **Simple CASE:** Compares a single expression to a set of predefined values.
  - **Searched CASE:** Evaluates multiple independent conditions.

- **Syntax:**

```plsql
CASE expression  
    WHEN value1 THEN 
        -- Code block  
    WHEN value2 THEN 
        -- Code block  
    ELSE  
        -- Default code block
END CASE;
```

- **Example: Grading System**

```plsql
DECLARE  
    marks NUMBER := 85;  
BEGIN  
    CASE  
        WHEN marks >= 90 THEN  
            DBMS_OUTPUT.PUT_LINE('Grade: A');  
        WHEN marks >= 75 THEN  
            DBMS_OUTPUT.PUT_LINE('Grade: B');  
        ELSE  
            DBMS_OUTPUT.PUT_LINE('Grade: C');  
    END CASE;  
END;
```

- **Best Practice:**  
Use CASE for scenarios with predefined values or conditions for better performance.

## 3. Loops in PL/SQL

### 3.1 Basic Loop

Executes repeatedly until explicitly exited using the EXIT statement.

- **Syntax:**

```plsql
LOOP  
    -- Code block  
    EXIT WHEN condition;  
END LOOP;
```

- **Example: Print Multiplication Table**

```plsql
DECLARE  
    i NUMBER := 1;
BEGIN  
    LOOP  
        DBMS_OUTPUT.PUT_LINE('5 x ' || i || ' = ' || (5 * i));  
        i := i + 1;  
        EXIT WHEN i > 10;  
    END LOOP;  
END;
```

### 3.2 WHILE Loop

Repeats execution as long as a condition is true.

- **Syntax:**

```plsql
WHILE condition LOOP  
    -- Code block  
END LOOP;
```

- **Example: Process Orders Until Stock is Depleted**

```plsql
DECLARE  
    stock NUMBER := 50;  
BEGIN  
    WHILE stock > 0 LOOP 
        DBMS_OUTPUT.PUT_LINE('Processing an order. Remaining stock: ' || stock);  
        stock := stock - 1;  
    END LOOP;  
END;
```

### 3.3 FOR Loop

Best for iterating over a fixed range or collection.

- **Syntax:**

```plsql
FOR variable IN start_value..end_value LOOP  
    -- Code block  
END LOOP;
```

- **Example: Generate Fibonacci Series**

```plsql
DECLARE 
    num1 NUMBER := 0;  
    num2 NUMBER := 1;  
    temp NUMBER;  
BEGIN  
    FOR i IN 1..10 LOOP  
        DBMS_OUTPUT.PUT_LINE(num1);  
        temp := num1 + num2;  
        num1 := num2;  
        num2 := temp;  
    END LOOP;  
END;
```

## 4. Advanced Topics and Best Practices

### 4.1 EXIT and CONTINUE Statements

- **EXIT:** Breaks out of a loop when a condition is met.
- **CONTINUE:** Skips the current iteration and moves to the next.

- **Example: Skip Processing for Certain Conditions**

```plsql
FOR i IN 1..10 LOOP  
    IF MOD(i, 2) = 0 THEN  
        CONTINUE; -- Skip even numbers  
    END IF;  
    DBMS_OUTPUT.PUT_LINE('Odd number: ' || i);  
END LOOP;
```

### 4.2 Bulk Operations in Loops

Use bulk operations like `FORALL` and `BULK COLLECT` for better performance when working with large data.

### 4.3 Nested Loops

Nested loops can be used but should be avoided in performance-critical applications due to increased complexity and runtime.

## 5. Practical Case Study: Automating Employee Appraisals

Q: Automate the calculation of performance bonuses for employees based on ratings using control structures.

```plsql
DECLARE  
    CURSOR emp_cursor IS  
        SELECT employee_id, performance_rating FROM employees;  
    bonus_percentage NUMBER;  
BEGIN  
    FOR emp_rec IN emp_cursor LOOP
        CASE emp_rec.performance_rating
            WHEN 'Outstanding' THEN  
                bonus_percentage := 20;  
            WHEN 'Exceeds Expectations' THEN 
                bonus_percentage := 10;  
            ELSE  
                bonus_percentage := 5;  
        END CASE;  
        DBMS_OUTPUT.PUT_LINE('Employee ID: ' || emp_rec.employee_id ||  ', Bonus: ' || bonus_percentage || '%');  
    END LOOP;  
END;
```
