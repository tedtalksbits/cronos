
# API Documentation: Cron Jobs

## Base URL
```
/api/cronjobs
```

---

### Cron Job Endpoints

#### 1. **Get All Cron Jobs**
- **URL**: `/`
- **Method**: `GET`
- **Description**: Retrieves all cron jobs for the authenticated user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200**: List of cron jobs.
  - **401**: Unauthorized.

---

#### 2. **Get One Cron Job**
- **URL**: `/:id`
- **Method**: `GET`
- **Description**: Retrieves details of a specific cron job by ID.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the cron job to retrieve.
- **Response**:
  - **200**: Cron job details.
  - **401**: Unauthorized.
  - **404**: Cron job not found.

---

#### 3. **Create Cron Job**
- **URL**: `/`
- **Method**: `POST`
- **Description**: Creates a new cron job (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Job Name",
    "command": "echo 'Hello World'",
    "schedule": "* * * * *",
    "status": "Active"
  }
  ```
- **Response**:
  - **201**: Cron job created successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **400**: Validation error.

---

#### 4. **Update Cron Job**
- **URL**: `/:id`
- **Method**: `PUT`
- **Description**: Updates a cron job by ID (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the cron job to update.
- **Request Body**:
  ```json
  {
    "name": "Updated Job Name",
    "command": "updated command",
    "schedule": "*/5 * * * *",
    "status": "Inactive"
  }
  ```
- **Response**:
  - **200**: Cron job updated successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **404**: Cron job not found.

---

#### 5. **Delete Cron Job**
- **URL**: `/:id`
- **Method**: `DELETE`
- **Description**: Deletes a cron job by ID (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the cron job to delete.
- **Response**:
  - **200**: Cron job deleted successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **404**: Cron job not found.

---

#### 6. **Get Cron Job Stats**
- **URL**: `/:id/stats`
- **Method**: `GET`
- **Description**: Retrieves statistics of a specific cron job.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the cron job to get stats for.
- **Response**:
  - **200**: Cron job statistics.
  - **401**: Unauthorized.
  - **404**: Cron job not found.

---

#### 7. **Get Cron Job Logs**
- **URL**: `/:id/logs`
- **Method**: `GET`
- **Description**: Retrieves logs for a specific cron job.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the cron job to get logs for.
- **Response**:
  - **200**: Cron job logs.
  - **401**: Unauthorized.
  - **404**: Cron job not found.

---

### Webhooks Endpoints

#### 1. **Create Cron Job Webhook**
- **URL**: `/:id/webhooks`
- **Method**: `POST`
- **Description**: Creates a new webhook for a cron job (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the cron job to associate the webhook with.
- **Request Body**:
  ```json
  {
    "url": "http://example.com/webhook",
    "event": "job_succeeded",
    "description": "Webhook description",
    "secret": "webhook_secret"
  }
  ```
- **Response**:
  - **201**: Webhook created successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **400**: Validation error.

---

#### 2. **Delete Cron Job Webhook**
- **URL**: `/:id/webhooks/:webhookId`
- **Method**: `DELETE`
- **Description**: Deletes a webhook for a cron job (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the cron job.
  - `webhookId`: The ID of the webhook to delete.
- **Response**:
  - **200**: Webhook deleted successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **404**: Webhook not found.

---

#### 3. **Update Cron Job Webhook**
- **URL**: `/:id/webhooks/:webhookId`
- **Method**: `PUT`
- **Description**: Updates a webhook for a cron job (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the cron job.
  - `webhookId`: The ID of the webhook to update.
- **Request Body**:
  ```json
  {
    "url": "http://updatedexample.com/webhook",
    "event": "job_failed",
    "description": "Updated description",
    "secret": "updated_secret"
  }
  ```
- **Response**:
  - **200**: Webhook updated successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **404**: Webhook not found.
