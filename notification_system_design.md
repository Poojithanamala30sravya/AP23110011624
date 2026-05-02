# Notification System Design

---

## Stage 1 — API Design

### Get Notifications
GET /notifications?studentId=123

Response:
[
  {
    "id": "uuid",
    "type": "Placement",
    "message": "Company hiring",
    "isRead": false,
    "createdAt": "timestamp"
  }
]

---

### Mark Notification as Read
PATCH /notifications/:id/read

---

### Create Notification
POST /notifications

Request:
{
  "studentId": 123,
  "type": "Placement",
  "message": "Amazon hiring"
}

---

### Real-time Updates
Use WebSockets or Server-Sent Events (SSE) for real-time notifications.

---

## Stage 2 — Database Design

We use PostgreSQL for storing notifications.

Schema:

notifications (
  id UUID PRIMARY KEY,
  student_id INT,
  type VARCHAR,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

Indexes:

CREATE INDEX idx_student_read_created 
ON notifications(student_id, is_read, created_at DESC);

---

### Problems with scaling:
- Large table size
- Slow queries without indexes

### Solutions:
- Proper indexing
- Table partitioning
- Archiving old data

---

## Stage 3 — Query Optimization

Problem Query:

SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;

---

### Issues:
- Full table scan
- No indexing

---

### Solution:

CREATE INDEX idx_notifications 
ON notifications(studentID, isRead, createdAt DESC);

---

### Optimized Query:

SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;

---

### Placement Query (last 7 days):

SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';

---

## Stage 4 — Performance Improvements

Problems:
- Notifications fetched on every page load
- Database gets overloaded
- Slow response time

Solutions:
1. Pagination (limit number of notifications per request)
2. Redis caching for unread notifications
3. Lazy loading (load more on scroll)
4. Use WebSockets instead of repeated API calls

Trade-offs:
- Caching adds complexity
- WebSockets need persistent connection

---

## Stage 5 — Reliable Notification System

Problems:
- Sequential execution
- No retry mechanism
- Failure stops entire process

Solution:
Use queue-based system (like BullMQ or Kafka)

Pseudo code:

for (student_id of student_ids) {
  queue.add("notify", { student_id, message });
}

Worker:

process(job) {
  send_email(job.data.student_id);
  save_to_db(job.data.student_id);
  push_notification(job.data.student_id);
}

---

### Benefits:
- Retry mechanism
- Parallel execution
- Fault tolerance

---

## Stage 6 — Priority Inbox

Priority logic:
Placement > Result > Event  
Then sort by latest timestamp

---

### Code:

function getPriority(type) {
  if (type === "Placement") return 3;
  if (type === "Result") return 2;
  return 1;
}

function getTopNotifications(notifications) {
  return notifications
    .sort((a, b) => {
      if (getPriority(b.Type) !== getPriority(a.Type)) {
        return getPriority(b.Type) - getPriority(a.Type);
      }
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    })
    .slice(0, 10);
}

---

### Optimization:
Use Min Heap (Top K elements) for large-scale systems.