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

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
import redis
import time
import json
import memcache
from tenacity import retry, stop_after_attempt, wait_fixed

# Connect to Redis (Level 1 Cache) with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def connect_to_redis():
    try:
        pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
        redis_client = redis.Redis(connection_pool=pool)
        print("Connected to Redis.")
        return redis_client
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        raise

redis_client = connect_to_redis()

# Connect to Memcache (Level 2 Cache)
try:
    memcache_client = memcache.Client(['127.0.0.1:11211'])
    print("Connected to Memcache.")
except Exception as e:
    print(f"Failed to connect to Memcache: {e}")
    exit(1)

# Simulated database fetch with error handling
def fetch_from_db(id):
    try:
        print(f"Fetching data from DB for {id}...")
        time.sleep(2)  # Simulate DB delay
        return {"id": id, "data": f"Data for {id}"}
    except Exception as e:
        print(f"DB fetch failed: {e}")
        raise

# Multi-Level Cache Logic with Redis backfill
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
        redis_client.setex(id, 10, cached_data_memcache)  # Populate Redis
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

##### **Explanation:**
- **Multi-Level Caching**: Uses Redis as the fast in-memory cache (Level 1) and Memcache as the distributed cache (Level 2).
- **Error Handling**: Added retry logic for Redis and error handling for Memcache and DB operations.
- **Redis Backfill**: On a Memcache hit, the data is backfilled into Redis to improve future access times.

##### **To Implement:**
1. Install Redis and Memcache.
2. Set up the Python `redis-py` and `python-memcached` libraries.
3. Implement the multi-level caching logic with Redis and Memcache.

---

### **9. Distributed Cache with Sharding**

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
from rediscluster import RedisCluster
import json
from tenacity import retry, stop_after_attempt, wait_fixed

# Connect to Redis Cluster with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def connect_to_redis_cluster():
    try:
        startup_nodes = [
            {"host": "localhost", "port": "7000"},
            {"host": "localhost", "port": "7001"},
            {"host": "localhost", "port": "7002"}
        ]
        rc = RedisCluster(startup_nodes=startup_nodes, decode_responses=True)
        print("Connected to Redis Cluster.")
        return rc
    except Exception as e:
        print(f"Failed to connect to Redis Cluster: {e}")
        raise

rc = connect_to_redis_cluster()

# Simulated DB fetch with error handling
def fetch_from_db(id):
    try:
        print(f"Fetching data from DB for {id}...")
        return {"id": id, "data": f"Data for {id}"}
    except Exception as e:
        print(f"DB fetch failed: {e}")
        raise

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

##### **Explanation:**
- **Distributed Cache with Sharding**: Uses Redis Cluster to distribute data across multiple nodes.
- **Error Handling**: Added retry logic for Redis Cluster connection and error handling for DB operations.
- **Automatic Sharding**: Redis Cluster handles sharding automatically.

##### **To Implement:**
1. Set up a Redis Cluster with multiple nodes.
2. Install the `redis-py-cluster` library.
3. Implement the distributed caching logic with Redis Cluster.

---

### **10. Time-Based Caching**

#### **Implementation Guide:**

##### **Step 1: Code Example**

```python
import redis
import time
import json
from apscheduler.schedulers.background import BackgroundScheduler
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

# Simulated DB fetch with error handling
def fetch_from_db(id):
    try:
        print(f"Fetching data from DB for {id}...")
        return {"id": id, "data": f"Data for {id}"}
    except Exception as e:
        print(f"DB fetch failed: {e}")
        raise

# Function to cache data periodically (every 10 seconds)
def refresh_cache(id):
    try:
        data = fetch_from_db(id)
        r.setex(id, 10, json.dumps(data))  # Set a TTL of 10 seconds for cache
        print(f"Cache for {id} refreshed!")
    except Exception as e:
        print(f"Cache refresh failed: {e}")

# Setup Scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(refresh_cache, 'interval', seconds=10, args=[1], max_instances=1)  # Refresh every 10 seconds
scheduler.start()

# Testing Time-Based Cache
try:
    while True:
        cached_data = r.get(1)
        if cached_data:
            print(f"Cache hit: {json.loads(cached_data)}")
        else:
            print(f"Cache miss for ID 1")
        time.sleep(5)  # Check every 5 seconds
except KeyboardInterrupt:
    scheduler.shutdown()
```

##### **Explanation:**
- **Time-Based Caching**: Uses APScheduler to refresh the cache periodically.
- **Error Handling**: Added retry logic for Redis connection and error handling for DB operations.
- **Scheduler**: The `refresh_cache` function runs every 10 seconds to update the cache.

##### **To Implement:**
1. Install the `APScheduler` library.
2. Set up a scheduler to refresh the cache periodically.
3. Implement the time-based caching logic with Redis.

---