# **Article 3: Mastering Maps, Concurrent Collections, and Advanced Java Collections**

In the previous articles, we explored the **`List`**, **`Set`**, and **`Queue`** interfaces and their implementations. Now, let’s dive into the **`Map` interface**, which is used to store key-value pairs, and explore advanced topics like **concurrent collections**, **custom sorting**, and **Stream API integration**. This article will help you master the more advanced aspects of the Java Collection Framework.

---

## **Table of Contents**
1. [Introduction to the Map Interface](#1-introduction-to-the-map-interface)
2. [Map Implementations](#2-map-implementations)
   - [HashMap](#hashmap)
   - [LinkedHashMap](#linkedhashmap)
   - [TreeMap](#treemap)
3. [Concurrent Collections](#3-concurrent-collections)
   - [ConcurrentHashMap](#concurrenthashmap)
   - [CopyOnWriteArrayList](#copyonwritearraylist)
4. [Custom Sorting](#4-custom-sorting)
   - [Comparable](#comparable)
   - [Comparator](#comparator)
5. [Stream API with Collections](#5-stream-api-with-collections)
6. [Performance Considerations](#6-performance-considerations)
7. [Real-World Use Cases](#7-real-world-use-cases)
8. [Conclusion](#8-conclusion)

---

## **1. Introduction to the Map Interface**
The **`Map` interface** represents a collection of key-value pairs. Unlike `List`, `Set`, and `Queue`, the `Map` interface does not extend the `Collection` interface because it operates on pairs of objects (keys and values) rather than individual elements.

### **Key Features of Map**
- **Unique Keys**: Each key in a `Map` must be unique.
- **Null Keys/Values**: Some implementations allow `null` keys and values (e.g., `HashMap`), while others do not (e.g., `TreeMap`).
- **Ordering**: Some implementations maintain order (e.g., `LinkedHashMap`), while others do not (e.g., `HashMap`).

---

## **2. Map Implementations**
The `Map` interface has several implementations, each with its own use cases and performance characteristics.

### **2.1 HashMap**
- **Description**: `HashMap` is an unordered collection that uses hashing to store key-value pairs.
- **Use Case**: Ideal for scenarios where you need fast access to values by key and don’t care about order.
- **Performance**:
  - Access/Insertion/Deletion: **O(1)** (average case)

#### **Example: Using HashMap**
```java
import java.util.HashMap;
import java.util.Map;

public class HashMapExample {
    public static void main(String[] args) {
        Map<String, Integer> fruitPrices = new HashMap<>();
        fruitPrices.put("Apple", 50);
        fruitPrices.put("Banana", 20);
        fruitPrices.put("Cherry", 30);

        System.out.println("Fruit Prices: " + fruitPrices); // Output: {Apple=50, Banana=20, Cherry=30}
        System.out.println("Price of Apple: " + fruitPrices.get("Apple")); // Output: 50
    }
}
```

---

### **2.2 LinkedHashMap**
- **Description**: `LinkedHashMap` maintains insertion order while storing key-value pairs.
- **Use Case**: Ideal for scenarios where you need to maintain the order of insertion.
- **Performance**:
  - Access/Insertion/Deletion: **O(1)** (average case)

#### **Example: Using LinkedHashMap**
```java
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapExample {
    public static void main(String[] args) {
        Map<String, Integer> orderedFruitPrices = new LinkedHashMap<>();
        orderedFruitPrices.put("Apple", 50);
        orderedFruitPrices.put("Banana", 20);
        orderedFruitPrices.put("Cherry", 30);

        System.out.println("Ordered Fruit Prices: " + orderedFruitPrices); // Output: {Apple=50, Banana=20, Cherry=30}
    }
}
```

---

### **2.3 TreeMap**
- **Description**: `TreeMap` is a sorted map that uses a Red-Black Tree for storage.
- **Use Case**: Ideal for scenarios where you need key-value pairs in sorted order.
- **Performance**:
  - Access/Insertion/Deletion: **O(log n)**

#### **Example: Using TreeMap**
```java
import java.util.TreeMap;
import java.util.Map;

public class TreeMapExample {
    public static void main(String[] args) {
        Map<String, Integer> sortedFruitPrices = new TreeMap<>();
        sortedFruitPrices.put("Banana", 20);
        sortedFruitPrices.put("Apple", 50);
        sortedFruitPrices.put("Cherry", 30);

        System.out.println("Sorted Fruit Prices: " + sortedFruitPrices); // Output: {Apple=50, Banana=20, Cherry=30}
    }
}
```

---

## **3. Concurrent Collections**
Concurrent collections are designed for use in multi-threaded environments. They provide thread-safe operations without the need for external synchronization.

### **3.1 ConcurrentHashMap**
- **Description**: `ConcurrentHashMap` is a thread-safe version of `HashMap`.
- **Use Case**: Ideal for scenarios where multiple threads need to read/write to a map concurrently.
- **Performance**:
  - Access/Insertion/Deletion: **O(1)** (average case)

#### **Example: Using ConcurrentHashMap**
```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class ConcurrentHashMapExample {
    public static void main(String[] args) {
        Map<String, Integer> concurrentFruitPrices = new ConcurrentHashMap<>();
        concurrentFruitPrices.put("Apple", 50);
        concurrentFruitPrices.put("Banana", 20);

        System.out.println("Concurrent Fruit Prices: " + concurrentFruitPrices); // Output: {Apple=50, Banana=20}
    }
}
```

---

### **3.2 CopyOnWriteArrayList**
- **Description**: `CopyOnWriteArrayList` is a thread-safe version of `ArrayList`.
- **Use Case**: Ideal for scenarios where reads are more frequent than writes.
- **Performance**:
  - Access: **O(1)**
  - Insertion/Deletion: **O(n)**

#### **Example: Using CopyOnWriteArrayList**
```java
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;

public class CopyOnWriteArrayListExample {
    public static void main(String[] args) {
        List<String> threadSafeFruits = new CopyOnWriteArrayList<>();
        threadSafeFruits.add("Apple");
        threadSafeFruits.add("Banana");

        System.out.println("Thread-Safe Fruits: " + threadSafeFruits); // Output: [Apple, Banana]
    }
}
```

---

## **4. Custom Sorting**
Java provides two ways to sort collections: **`Comparable`** and **`Comparator`**.

### **4.1 Comparable**
- **Description**: The `Comparable` interface is used to define the natural ordering of objects.
- **Use Case**: Ideal for scenarios where you want to define a default sorting order for a class.

#### **Example: Using Comparable**
```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class Fruit implements Comparable<Fruit> {
    String name;
    int price;

    Fruit(String name, int price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public int compareTo(Fruit other) {
        return this.price - other.price;
    }

    @Override
    public String toString() {
        return name + "=" + price;
    }
}

public class ComparableExample {
    public static void main(String[] args) {
        List<Fruit> fruits = new ArrayList<>();
        fruits.add(new Fruit("Apple", 50));
        fruits.add(new Fruit("Banana", 20));
        fruits.add(new Fruit("Cherry", 30));

        Collections.sort(fruits);
        System.out.println("Sorted Fruits: " + fruits); // Output: [Banana=20, Cherry=30, Apple=50]
    }
}
```

---

### **4.2 Comparator**
- **Description**: The `Comparator` interface is used to define custom sorting logic.
- **Use Case**: Ideal for scenarios where you need multiple sorting criteria or want to sort objects without modifying their class.

#### **Example: Using Comparator**
```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

class Fruit {
    String name;
    int price;

    Fruit(String name, int price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public String toString() {
        return name + "=" + price;
    }
}

public class ComparatorExample {
    public static void main(String[] args) {
        List<Fruit> fruits = new ArrayList<>();
        fruits.add(new Fruit("Apple", 50));
        fruits.add(new Fruit("Banana", 20));
        fruits.add(new Fruit("Cherry", 30));

        Comparator<Fruit> priceComparator = (f1, f2) -> f1.price - f2.price;
        Collections.sort(fruits, priceComparator);
        System.out.println("Sorted Fruits: " + fruits); // Output: [Banana=20, Cherry=30, Apple=50]
    }
}
```

---

## **5. Stream API with Collections**
The **Stream API** (introduced in Java 8) allows you to process collections in a functional style.

#### **Example: Using Stream API**
```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class StreamAPIExample {
    public static void main(String[] args) {
        List<String> fruits = Arrays.asList("Apple", "Banana", "Cherry");

        // Filter and collect
        List<String> filteredFruits = fruits.stream()
                                            .filter(f -> f.startsWith("A"))
                                            .collect(Collectors.toList());

        System.out.println("Filtered Fruits: " + filteredFruits); // Output: [Apple]
    }
}
```

---

## **6. Performance Considerations**
Here’s a quick comparison of the performance of common `Map` implementations:

| Implementation       | Access Time | Insertion/Deletion Time | Notes                                                                 |
|----------------------|-------------|-------------------------|-----------------------------------------------------------------------|
| **HashMap**          | O(1)        | O(1)                    | Unordered, uses hashing.                                              |
| **LinkedHashMap**    | O(1)        | O(1)                    | Maintains insertion order.                                            |
| **TreeMap**          | O(log n)    | O(log n)                | Sorted, uses Red-Black Tree.                                          |
| **ConcurrentHashMap**| O(1)        | O(1)                    | Thread-safe, suitable for concurrent access.                          |

---

## **7. Real-World Use Cases**
- **`HashMap`**: Storing user sessions or caching data.
- **`LinkedHashMap`**: Implementing an LRU (Least Recently Used) cache.
- **`TreeMap`**: Storing sorted configurations or settings.
- **`ConcurrentHashMap`**: Managing shared resources in multi-threaded applications.
- **`CopyOnWriteArrayList`**: Storing read-heavy data like configuration lists.

---

## **8. Conclusion**
In this article, we explored the **`Map` interface**, **concurrent collections**, and advanced topics like **custom sorting** and the **Stream API**. These concepts are essential for writing efficient and scalable Java applications. With this knowledge, you can confidently choose the right collection for your use case and leverage advanced features to optimize your code.

This concludes our series on Java Collections. I hope you found it helpful! Let me know if you have any questions or need further assistance. 😊

---
