# Caching in System Design: Examples
---

### **1. Simple Caching with Redis in Python (Using `redis-py`)**

#### **Implementation Guide:**

##### **Step 1: Install Redis**
Install Redis locally or use a cloud service (Redis Labs, Amazon ElastiCache). Install the `redis-py` library for Python.

```bash
pip install redis
```

##### **Step 2: Code Example**

```python
import redis
import time
import json
from tenacity import retry, stop_after_attempt, wait_fixed

# Connect to Redis with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def connect_to_redis():
    try:
        pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
        r = redis.Redis(connection_pool=pool)
        print("Connected to Redis.")
        return r
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        raise

r = connect_to_redis()

# Simulated database fetch function with error handling
def get_data_from_db(id):
    try:
        print("Fetching data from DB...")
        time.sleep(2)  # Simulate slow DB response
        return {"id": id, "data": f"Data for {id}"}
    except Exception as e:
        print(f"DB fetch failed: {e}")
        raise

# Cache function using Redis with stampede protection
def get_data_with_cache(id):
    cached_data = r.get(id)
    if cached_data:
        print("Cache hit")
        return json.loads(cached_data.decode("utf-8"))
    
    print("Cache miss")
    with r.lock(f"lock:{id}", timeout=5):
        # Check cache again inside the lock
        cached_data = r.get(id)
        if cached_data:
            return json.loads(cached_data.decode("utf-8"))
        
        data = get_data_from_db(id)
        r.setex(id, 10, json.dumps(data))  # Cache for 10 seconds
        return data

# Testing the caching
print(get_data_with_cache(1))  # Cache miss
print(get_data_with_cache(1))  # Cache hit

# Wait for the cache to expire
time.sleep(11)
print(get_data_with_cache(1))  # Cache miss after expiration
```

##### **Explanation:**
- **Error Handling**: The Redis connection is handled using a `try-except` block with retry logic to catch transient connection errors.
- **Cache Stampede Protection**: Redis locks prevent multiple threads from fetching the same uncached data simultaneously.
- **Data Serialization**: The cached data is stored and retrieved in JSON format to handle more complex data types.

##### **To Implement:**
1. Install Redis.
2. Set up the Python `redis-py` library.
3. Implement the caching function that connects to Redis, checks for cache hits, and stores results with TTL.

---

### **2. Cache-Aside Pattern Example**

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
import redis
import time
import json
from tenacity import retry, stop_after_attempt, wait_fixed

# Connect to Redis with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def connect_to_redis():
    try:
        pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
        r = redis.Redis(connection_pool=pool)
        print("Connected to Redis.")
        return r
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        raise

r = connect_to_redis()

# Simulated DB fetch function with error handling
def get_user_from_db(user_id):
    try:
        print(f"Fetching user {user_id} from DB")
        time.sleep(2)  # Simulate slow DB response
        return {"user_id": user_id, "name": f"User {user_id}"}
    except Exception as e:
        print(f"DB fetch failed: {e}")
        raise

# Cache-Aside Pattern with stampede protection
def get_user(user_id):
    cached_user = r.get(f"user:{user_id}")
    if cached_user:
        print(f"Cache hit for user {user_id}")
        return json.loads(cached_user.decode("utf-8"))
    
    print(f"Cache miss for user {user_id}")
    with r.lock(f"lock:user:{user_id}", timeout=5):
        # Check cache again inside the lock
        cached_user = r.get(f"user:{user_id}")
        if cached_user:
            return json.loads(cached_user.decode("utf-8"))
        
        user_data = get_user_from_db(user_id)
        r.setex(f"user:{user_id}", 30, json.dumps(user_data))  # Cache for 30 seconds
        return user_data

# Testing
print(get_user(1))  # Cache miss
print(get_user(1))  # Cache hit

time.sleep(31)  # Wait for the cache to expire
print(get_user(1))  # Cache miss after TTL expiry
```

##### **Explanation:**
- **Cache-Aside**: This pattern loads data into the cache only when it is needed. The application checks the cache first and fetches data from the database if it's not found in the cache. The result is cached for future use.
- **Error Handling**: Redis connection errors are handled gracefully with retry logic.
- **Cache Stampede Protection**: Redis locks prevent multiple threads from fetching the same uncached data simultaneously.

##### **To Implement:**
1. Connect to Redis with a connection pool.
2. Implement the `get_user` function with cache-lookup and database fallback.
3. Use TTL to control cache expiry.

---

### **3. Cache Invalidation (Manual and Time-Based)**

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
import redis
import time
import json
from tenacity import retry, stop_after_attempt, wait_fixed

# Connect to Redis with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def connect_to_redis():
    try:
        pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
        r = redis.Redis(connection_pool=pool)
        print("Connected to Redis.")
        return r
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        raise

r = connect_to_redis()

# Simulated DB update with error handling
def update_user_in_db(user_id, name):
    try:
        print(f"Updating user {user_id} in DB to {name}")
        time.sleep(1)  # Simulate DB write delay
        return {"user_id": user_id, "name": name}
    except Exception as e:
        print(f"DB update failed: {e}")
        raise

# Cache function with stampede protection
def get_user(user_id):
    cached_user = r.get(f"user:{user_id}")
    if cached_user:
        print(f"Cache hit for user {user_id}")
        return json.loads(cached_user.decode("utf-8"))
    
    print(f"Cache miss for user {user_id}")
    with r.lock(f"lock:user:{user_id}", timeout=5):
        # Check cache again inside the lock
        cached_user = r.get(f"user:{user_id}")
        if cached_user:
            return json.loads(cached_user.decode("utf-8"))
        
        user_data = get_user_from_db(user_id)
        r.setex(f"user:{user_id}", 30, json.dumps(user_data))  # Cache for 30 seconds
        return user_data

# Function to update user and invalidate cache
def update_user(user_id, new_name):
    user_data = update_user_in_db(user_id, new_name)
    r.setex(f"user:{user_id}", 30, json.dumps(user_data))  # Update cache
    print(f"Cache updated for user {user_id}")
    return user_data

# Testing the update and invalidate process
print(get_user(1))  # Cache miss
update_user(1, "Updated User")
print(get_user(1))  # Cache hit after update
```

##### **Explanation:**
- **Manual Invalidation**: The cache is explicitly updated after an update to ensure fresh data is retrieved from the database.
- **TTL Management**: The TTL ensures cache expiration, but manual updates are used after critical updates to guarantee accuracy.
- **Error Handling**: Redis connection errors are handled gracefully with retry logic.

##### **To Implement:**
1. Use `r.setex()` to update the cache after updates.
2. Ensure cache expiration is used in conjunction with manual updates to avoid stale data.

---

### **4. Advanced Cache with Expiry (TTL)**

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
import redis
import time
import json
from tenacity import retry, stop_after_attempt, wait_fixed

# Connect to Redis with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def connect_to_redis():
    try:
        pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
        r = redis.Redis(connection_pool=pool)
        print("Connected to Redis.")
        return r
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        raise

r = connect_to_redis()

# Simulated database fetch with error handling
def fetch_data(id):
    try:
        print(f"Fetching data for {id} from DB...")
        time.sleep(2)  # Simulate DB fetch delay
        return {"id": id, "data": f"Data for {id}"}
    except Exception as e:
        print(f"DB fetch failed: {e}")
        raise

# Cache function with stampede protection
def get_data(id):
    cached_data = r.get(id)
    if cached_data:
        print(f"Cache hit for {id}")
        return json.loads(cached_data.decode("utf-8"))
    
    print(f"Cache miss for {id}")
    with r.lock(f"lock:{id}", timeout=5):
        # Check cache again inside the lock
        cached_data = r.get(id)
        if cached_data:
            return json.loads(cached_data.decode("utf-8"))
        
        data = fetch_data(id)
        r.setex(id, 5, json.dumps(data))  # Cache with 5-second TTL
        return data

# Testing the cache expiry
print(get_data(1))  # Cache miss
time.sleep(3)
print(get_data(1))  # Cache hit within TTL
time.sleep(3)
print(get_data(1))  # Cache miss after TTL expiry
```

##### **Explanation:**
- **TTL Management**: The cache expires after a set duration (5 seconds in this case). The system must fetch new data once the cache expires.
- **Cache Stampede Protection**: Redis locks prevent multiple threads from fetching the same uncached data simultaneously.
- **Error Handling**: Redis connection errors are handled gracefully with retry logic.

##### **To Implement:**
1. Set an appropriate TTL value depending on your use case.
2. Implement fallback logic to re-fetch data when TTL expires.

---

### **5. Write-Through Cache Strategy**

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
import redis
import time
import json
from tenacity import retry, stop_after_attempt, wait_fixed

# Connect to Redis with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def connect_to_redis():
    try:
        pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
        r = redis.Redis(connection_pool=pool)
        print("Connected to Redis.")
        return r
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        raise

r = connect_to_redis()

# Simulated DB save with error handling
def save_user_to_db(user_id, user_data):
    try:
        print(f"Saving user {user_id} to DB")
        time.sleep(1)  # Simulate DB write delay
        return user_data
    except Exception as e:
        print(f"DB save failed: {e}")
        raise

# Write-Through Cache
def write_through_cache(user_id, user_data):
    # Write to cache first
    r.set(f"user:{user_id}", json.dumps(user_data))
    
    # Write to DB as well
    saved_user = save_user_to_db(user_id, user_data)
    print(f"User {user_id} saved successfully in both cache and DB.")
    return saved_user

# Testing Write-Through Cache
user_data = {"user_id": 1, "name": "Alice"}
print(write_through_cache(1, user_data))
```

##### **Explanation:**
- **Write-Through**: This approach synchronizes the cache and database by ensuring that every write operation to the cache is also written to the database.
- **Error Handling**: Redis connection errors are handled gracefully with retry logic.
- **Use Cases**: Suitable for scenarios where you want to ensure that the database and cache remain consistent without relying on background processing.

##### **To Implement:**
1. Write the data to both Redis and the database immediately.
2. Ensure that any failures in one system (cache or DB) are handled appropriately to maintain consistency.

---

### **6. Read-Through Cache**

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
import redis
import time
import json
from tenacity import retry, stop_after_attempt, wait_fixed

# Connect to Redis with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def connect_to_redis():
    try:
        pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
        r = redis.Redis(connection_pool=pool)
        print("Connected to Redis.")
        return r
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        raise

r = connect_to_redis()

# Simulated data fetch (Database call) with error handling
def fetch_data_from_db(id):
    try:
        print(f"Fetching data for {id} from DB...")
        time.sleep(2)  # Simulate DB fetch delay
        return {"id": id, "data": f"Data for {id}"}
    except Exception as e:
        print(f"DB fetch failed: {e}")
        raise

# Read-Through Cache with stampede protection
def get_data(id):
    cached_data = r.get(id)
    if cached_data:
        print(f"Cache hit for {id}")
        return json.loads(cached_data.decode("utf-8"))
    
    print(f"Cache miss for {id}")
    with r.lock(f"lock:{id}", timeout=5):
        # Check cache again inside the lock
        cached_data = r.get(id)
        if cached_data:
            return json.loads(cached_data.decode("utf-8"))
        
        data = fetch_data_from_db(id)
        r.setex(id, 10, json.dumps(data))  # Cache with 10-second TTL
        return data

# Testing Read-Through Cache
print(get_data(1))  # Cache miss
print(get_data(1))  # Cache hit
```

##### **Explanation:**
- **Read-Through**: The function behaves like a read-through cache. The first time the data is requested, it populates the cache from the database automatically.
- **Cache Stampede Protection**: Redis locks prevent multiple threads from fetching the same uncached data simultaneously.
- **Error Handling**: Redis connection errors are handled gracefully with retry logic.

##### **To Implement:**
1. Connect to Redis with a connection pool.
2. Implement the `get_data` function with cache-lookup and database fallback.
3. Use TTL to control cache expiry.

---

### **7. Write-Behind (Lazy Write) Cache**

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
import redis
import time
import json
from celery import Celery

# Connect to Redis
try:
    pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
    r = redis.Redis(connection_pool=pool)
    print("Connected to Redis.")
except redis.ConnectionError as e:
    print(f"Failed to connect to Redis: {e}")
    exit(1)

# Celery setup for background tasks
app = Celery('tasks', broker='pyamqp://guest@localhost//')

@app.task
def save_to_db_later(user_id, user_data):
    try:
        print(f"Saving {user_data} for user {user_id} to DB after delay...")
        time.sleep(2)  # Simulate DB write delay
        print(f"User {user_id} saved to DB.")
    except Exception as e:
        print(f"DB write failed: {e}")

# Write-Behind (Lazy Write) Cache
def write_behind_cache(user_id, user_data):
    r.set(f"user:{user_id}", json.dumps(user_data))  # Write to cache
    save_to_db_later.delay(user_id, user_data)  # Async DB write
    print(f"Data for user {user_id} cached. DB update is happening in the background.")
    return user_data

# Testing Write-Behind Cache
user_data = {"user_id": 1, "name": "John"}
write_behind_cache(1, user_data)
```

##### **Explanation:**
- **Write-Behind**: The cache is updated immediately, and the database update happens asynchronously in a background task using Celery.
- **Error Handling**: Redis connection errors are handled gracefully.
- **Use Cases**: Suitable for scenarios where you want to avoid slow writes impacting the user experience.

##### **To Implement:**
1. Install Celery and set up a message broker (e.g., RabbitMQ).
2. Implement the `write_behind_cache` function to write to the cache and trigger an async DB update.

---

### **8. Multi-Level Caching**
**Multi-Level Caching** leverages multiple levels of cache, like having an in-memory cache (Redis) and a distributed cache (e.g., using Memcached or a cloud solution). This approach allows more frequent reads from the fast local cache while using the secondary cache layer for persistence.

#### **Scenario:**
A system that requires a hierarchy of caches to balance fast data access (in-memory) with large-scale persistence (distributed cache).

##### **Implementation Example:**

```python
import redis
import time
import json
import memcache

# Connect to Redis (Level 1 Cache)
redis_pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
redis_client = redis.Redis(connection_pool=redis_pool)

# Connect to Memcache (Level 2 Cache)
memcache_client = memcache.Client(['127.0.0.1:11211'])

# Simulated database fetch
def fetch_from_db(id):
    print(f"Fetching data from DB for {id}...")
    time.sleep(2)  # Simulate DB delay
    return {"id": id, "data": f"Data for {id}"}

# Multi-Level Cache Logic
def get_data(id):
    # Level 1: Check Redis (fast in-memory cache)
    cached_data = redis_client.get(id)
    if cached_data:
        print(f"Cache hit in Redis (Level 1) for {id}")
        return json.loads(cached_data.decode("utf-8"))
    
    # Level 2: Check Memcache if not in Redis
    cached_data_memcache = memcache_client.get(id)
    if cached_data_memcache:
        print(f"Cache hit in Memcache (Level 2) for {id}")
        return json.loads(cached_data_memcache.decode("utf-8"))
    
    # Cache miss, fetch from DB
    print(f"Cache miss for {id}, fetching from DB...")
    data = fetch_from_db(id)
    
    # Store in Redis (Level 1 cache)
    redis_client.setex(id, 10, json.dumps(data))  # Cache with 10-second TTL
    # Store in Memcache (Level 2 cache)
    memcache_client.set(id, json.dumps(data))
    
    return data

# Testing Multi-Level Cache
print(get_data(1))  # Cache miss, fetch from DB
print(get_data(1))  # Cache hit in Redis (Level 1)
```

**Explanation:**
- **Level 1** (Redis) is the fast, in-memory cache.
- **Level 2** (Memcache) is a more distributed, persistent cache that can store larger datasets.
- This multi-level approach optimizes read operations across multiple layers of caching.

---

### **9. Distributed Cache with Sharding**

In the case of **sharding**, the cache is split across multiple Redis servers or nodes to distribute the data. Redis itself supports **sharding** natively through **Redis Cluster**, where it divides the data into slots and stores them across multiple Redis instances.

While I can't simulate a full Redis Cluster setup here, I can show how you would configure sharding using a **Redis client** that supports sharding.

#### **Example: Redis Cluster Client (Sharding)**

Using a Python library like **`redis-py-cluster`**, you can implement a distributed cache with sharding. Here's an example setup for it:

##### **Installation**:
You'll need to install the `redis-py-cluster` library.

```bash
pip install redis-py-cluster
```

##### **Example Code**:

```python
from rediscluster import RedisCluster
import json

# Connect to Redis Cluster
startup_nodes = [
    {"host": "localhost", "port": "7000"},
    {"host": "localhost", "port": "7001"},
    {"host": "localhost", "port": "7002"}
]

# Connect to the Redis Cluster
rc = RedisCluster(startup_nodes=startup_nodes, decode_responses=True)

# Simulated DB fetch
def fetch_from_db(id):
    print(f"Fetching data from DB for {id}...")
    return {"id": id, "data": f"Data for {id}"}

# Function to get data from the distributed cache
def get_data_from_cache(id):
    cached_data = rc.get(id)
    if cached_data:
        print(f"Cache hit for {id}")
        return json.loads(cached_data)
    else:
        print(f"Cache miss for {id}")
        data = fetch_from_db(id)
        rc.set(id, json.dumps(data))
        return data

# Testing Redis Cluster (Sharding)
print(get_data_from_cache(1))  # Cache miss
print(get_data_from_cache(1))  # Cache hit
```

**Explanation**:
- The `RedisCluster` client connects to multiple Redis nodes (servers), and Redis handles sharding data automatically.
- If a data key doesn't exist in the cache, it fetches from the simulated database and stores it in the cluster.

To properly set this up, you would need a Redis Cluster running with multiple Redis nodes (`localhost:7000`, `localhost:7001`, etc.) that are configured to handle sharding.

---

### **10. Time-Based Caching**

In **Time-Based Caching**, you typically want to invalidate or refresh the cache periodically based on a fixed interval rather than relying on events. This is often done using **scheduled tasks**.

You can achieve time-based caching in Python with libraries like **Celery**, **APScheduler**, or even simple `time.sleep` with periodic cache invalidation. For this example, I'll show you how to do it with **APScheduler**.

##### **Installation**:
You'll need to install the `APScheduler` library.

```bash
pip install apscheduler
```

##### **Example Code**:

```python
import redis
import time
import json
from apscheduler.schedulers.background import BackgroundScheduler

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Simulated DB fetch
def fetch_from_db(id):
    print(f"Fetching data from DB for {id}...")
    return {"id": id, "data": f"Data for {id}"}

# Function to cache data periodically (every 10 seconds)
def refresh_cache(id):
    data = fetch_from_db(id)
    r.setex(id, 10, json.dumps(data))  # Set a TTL of 10 seconds for cache
    print(f"Cache for {id} refreshed!")

# Setup Scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(refresh_cache, 'interval', seconds=10, args=[1])  # Refresh every 10 seconds
scheduler.start()

# Testing Time-Based Cache
while True:
    cached_data = r.get(1)
    if cached_data:
        print(f"Cache hit: {json.loads(cached_data)}")
    else:
        print(f"Cache miss for ID 1")
    time.sleep(5)  # Check every 5 seconds
```

**Explanation**:
- The `APScheduler` is set up to run the `refresh_cache` function every 10 seconds. This function fetches fresh data from the database and updates the cache with a **TTL (Time to Live)** of 10 seconds.
- In the main loop, the system checks the cache every 5 seconds. If data is available, it uses it. If not, it triggers a cache refresh.

**Note**:
- In this example, the cache is set to expire every 10 seconds. You can adjust the frequency based on how often you want the cache to be refreshed.
- The scheduler runs in the background and updates the cache periodically without needing explicit user intervention.

---
