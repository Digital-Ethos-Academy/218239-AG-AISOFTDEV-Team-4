# Security Review: FastAPI Mental Health Backend

## ✅ Strengths

- **Input validation** is enforced via Pydantic models for all incoming data.
- **ORM usage** through SQLAlchemy prevents raw SQL injection risks.
- **Unique constraints** on `email` prevent duplicate user registration.
- **Password separation**: Passwords are stored separately in a `password_hash` field.

---

## ⚠️ Potential Vulnerabilities & Recommendations

### 1. 🔓 Plaintext Password Storage

- **Issue:** Passwords are stored as-is in the `password_hash` field.
- **Risk:** Severe if exposed — could compromise user accounts.
- **Fix:**
  Use proper password hashing:
  ```python
  from passlib.context import CryptContext
  pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

  hashed_password = pwd_context.hash(user.password)
````

---

### 2. 🔐 No Authentication or Authorization

* **Issue:** Any client can create/read/update/delete any user's data.
* **Risk:** No access control means users can impersonate others.
* **Fix:**

  * Add authentication using OAuth2 and JWT (FastAPI has built-in support).
  * Restrict endpoints using `Depends(get_current_user)`.

---

### 3. 🧱 Missing Length Limits on Fields

* **Issue:** Fields like `display_name`, `mood`, `content` have no `max_length`.
* **Risk:** Risk of abuse (large payloads), degraded performance, UI issues.
* **Fix:** Use Pydantic's `Field(..., max_length=...)` to validate string length.

---

### 4. 🌐 CORS Not Configured

* **Issue:** CORS middleware is not enabled.
* **Risk:** API cannot be safely accessed from frontend apps in the browser.
* **Fix:**

  ```python
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000"],  # Adjust as needed
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

---

### 5. ⚙️ Manual Cascade Deletes

* **Issue:** Journal and Mood entries are manually deleted when a user is deleted.
* **Risk:** Can lead to orphaned data if logic is missed.
* **Fix:** Use `ondelete="CASCADE"` in SQLAlchemy `ForeignKey`, and relationships.

---

## 🧠 Summary

This backend is clean and functional, with solid use of FastAPI and SQLAlchemy. However, it's missing key production-ready security features:

* 🔒 Secure password handling
* 🔐 Authentication/authorization
* 🛡️ Input hardening
* 🌐 CORS configuration
* 📉 Safer data relationships

With those added, your app would be ready for secure multi-user deployment.
