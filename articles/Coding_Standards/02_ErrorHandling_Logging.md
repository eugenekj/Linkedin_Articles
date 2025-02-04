# Advanced Error Handling, Logging Practices, and Clean Architecture Principles
by Eugene Koshy

## Introduction
In the ever-evolving software landscape, applications are expected to be robust, maintainable, and scalable. Advanced error handling, logging practices, and clean architecture principles play a pivotal role in meeting these expectations. These practices ensure that systems remain resilient, developers can debug issues efficiently, and codebases stay manageable as they grow.

This article delves into these three crucial aspects with practical examples in Python, Java, and SQL, building upon the foundation of coding standards and discipline discussed last week.

## Advanced Error Handling
Effective error handling goes beyond simply catching and printing exceptions; it involves anticipating potential issues such as invalid inputs, resource unavailability, or unexpected conditions. For instance, validating user inputs can prevent injection attacks or processing errors, while implementing retry mechanisms ensures temporary failures, such as network timeouts, don't disrupt application flow. By addressing these scenarios proactively, you can maintain stability and provide a better user experience.

### Best Practices for Error Handling
1. **Use Specific Exceptions:** Avoid catching general exceptions (e.g., `Exception` in Java or `BaseException` in Python) as they can mask underlying issues. Instead, target exceptions like `FileNotFoundError` or `IllegalArgumentException` to handle specific problems effectively.
2. **Create Custom Exceptions:** Use domain-specific exceptions to provide meaningful error messages. For example, a `UserNotAuthorizedException` can indicate a specific permission issue, making debugging faster and more intuitive.
3. **Log Errors Appropriately:** Capture the stack trace and relevant details for debugging. For instance, include unique request IDs or timestamps in logs to trace errors back to their origin during high-traffic events.
4. **Fail Gracefully:** Provide fallback mechanisms to ensure the application remains usable. For example, if a payment gateway fails, offer users the option to retry or select an alternate payment method while maintaining their session data.

### Examples:
**Python:**
```python
class InvalidTransactionError(Exception):
    def __init__(self, message="Invalid transaction"):
        super().__init__(message)

try:
    amount = -10
    if amount < 0:
        raise InvalidTransactionError("Transaction amount cannot be negative.")
except InvalidTransactionError as e:
    print(f"Error: {e}")
```

**Java:**
```java
class InvalidTransactionException extends Exception {
    public InvalidTransactionException(String message) {
        super(message);
    }
}

public class Main {
    public static void main(String[] args) {
        try {
            double amount = -10;
            if (amount < 0) {
                throw new InvalidTransactionException("Transaction amount cannot be negative.");
            }
        } catch (InvalidTransactionException e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

**SQL:**
```sql
-- Example for MSSQL (T-SQL)
BEGIN
    IF @transaction_amount < 0
    BEGIN
        THROW 50001, 'Transaction amount cannot be negative.', 1;
    END

    -- Example for PL/SQL:
    DECLARE
        ex_invalid_transaction EXCEPTION;
    BEGIN
        IF transaction_amount < 0 THEN
            RAISE ex_invalid_transaction;
        END IF;
    EXCEPTION
        WHEN ex_invalid_transaction THEN
            DBMS_OUTPUT.PUT_LINE('Error: Transaction amount cannot be negative.');
    END;
END;
```

## Logging Practices
Logging is essential for understanding application behavior, diagnosing issues, and ensuring compliance in production environments. Well-structured logging can help developers track errors, monitor system health, and ensure that issues are quickly addressed.

### Best Practices for Logging
1. **Adopt Structured Logging:** Use structured formats (e.g., JSON) for better parsing and analysis.
2. **Use Appropriate Levels:** Employ logging levels like `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `CRITICAL` (or equivalent) to classify the severity of the logs.
3. **Avoid Sensitive Data:** Exclude sensitive information (e.g., passwords, personal data) to maintain privacy.
4. **Centralize Logs:** Use tools like ELK Stack, AWS CloudWatch, or Prometheus for centralized log management. This makes it easier to monitor and respond to issues in real-time.
5. **Log Contextually:** Log useful contextual information, such as request IDs, user information, and service version, to make logs more meaningful and traceable.
6. **Asynchronous Logging:** For performance-sensitive applications, use asynchronous logging to avoid blocking operations during logging.
7. **Set Up Alerts for Critical Errors:** Set up alerts for errors with high severity, using tools like PagerDuty or Opsgenie to notify the right team when critical issues arise.

### Examples:
**Python:**
```python
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s - %(request_id)s')

# Add a custom filter to add context to logs
class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = '12345'  # For example, dynamically set per request
        return True

logger = logging.getLogger()
logger.addFilter(RequestIdFilter())

# Log an error with custom context
try:
    raise ValueError("Invalid value")
except ValueError as e:
    logger.error("An error occurred: %s", e)
```

**Java:**
```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Main {
    private static final Logger logger = LogManager.getLogger(Main.class);

    public static void main(String[] args) {
        try {
            String requestId = "12345";  // Example request ID for distributed systems
            throw new Exception("Sample exception");
        } catch (Exception e) {
            logger.error("Request ID: {} - An error occurred: ", requestId, e);
        }
    }
}
```

**SQL:**
```sql
-- Example for MSSQL (T-SQL)
DECLARE @request_id NVARCHAR(50) = '12345';  -- Example request ID

INSERT INTO error_logs (timestamp, level, message, request_id)
VALUES (GETDATE(), 'ERROR', 'Invalid transaction detected.', @request_id);
```

## Clean Architecture Principles
Clean architecture emphasizes the separation of concerns, ensuring that code remains modular, testable, and easy to understand. The focus is on creating systems that are flexible, maintainable, and scalable.

### Key Principles:
1. **Independent Layers (Separation of Concerns):** Organize code into layers that have specific responsibilities.
2. **Dependency Rule:** The inner layers (business logic) should never depend on the outer layers. Instead, the outer layers depend on the inner ones. This ensures the business logic remains decoupled from implementation details.
3. **Testability:** Design components to be independently testable, making it easier to write unit tests for each layer.
4. **Interface Segregation:** Create focused interfaces for each part of your application, so components only depend on the methods they use.
5. **Inversion of Control (IoC):** Use dependency injection to provide dependencies from the outside, rather than having components create them internally.

### Examples:
**Python (Domain + Service Layer + Controller):**
```python
# Domain Layer: Core business logic
class Order:
    def __init__(self, order_id, amount):
        self.order_id = order_id
        self.amount = amount

# Service Layer: Coordinates business logic
class OrderService:
    def process_order(self, order):
        if order.amount < 0:
            raise ValueError("Order amount cannot be negative.")
        return f"Processing order {order.order_id}"

# Controller Layer: Interacts with the user
class OrderController:
    def __init__(self, service):
        self.service = service
    
    def handle_order(self, order):
        try:
            result = self.service.process_order(order)
            return result
        except ValueError as e:
            return f"Error: {e}"

# Main: Wiring everything together
order = Order(order_id=1, amount=-100)
service = OrderService()
controller = OrderController(service)
print(controller.handle_order(order))
```

**Java (Hexagonal Architecture with Dependency Injection):**
```java
// Domain Layer: Core business logic
public class Order {
    private int orderId;
    private double amount;

    // Constructor and getters/setters
}

// Service Layer: Coordinates business logic
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public String processOrder(Order order) {
        if (order.getAmount() < 0) {
            throw new IllegalArgumentException("Order amount cannot be negative.");
        }
        return "Processing order " + order.getOrderId();
    }
}

// Repository Interface (Dependency Injection)
public interface OrderRepository {
    void save(Order order);
}

// Main: Wiring everything together
public class Main {
    public static void main(String[] args) {
        Order order = new Order(1, -100.0);
        OrderRepository orderRepo = new InMemoryOrderRepository();
        OrderService service = new OrderService(orderRepo);
        System.out.println(service.processOrder(order));
    }
}
```

**SQL (Layered Example):**
```sql
DECLARE
    -- Declare the input parameters
    v_order_id INT := :order_id;  -- Input order_id parameter
    v_amount DECIMAL := :amount;  -- Input amount parameter
BEGIN
    -- Check if the amount is negative
    IF v_amount < 0 THEN
        -- Raise an exception if the amount is negative
        RAISE_APPLICATION_ERROR(-20001, 'Transaction amount cannot be negative');
    ELSE
        -- Insert the order into the database if the amount is valid
        INSERT INTO Orders (order_id, amount)
        VALUES (v_order_id, v_amount);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Handle any other errors that might occur
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
```

## Conclusion
By incorporating advanced error handling, robust logging practices, and clean architecture principles, we create systems that are not only easier to maintain but also more resilient and adaptable to future changes. These practices are integral to building scalable, reliable, and testable applications. Implementing these approaches will help ensure that your software systems are ready for the demands of real-world applications.
```
