
# API Documentation: Scripts

## Base URL
```
/api/scripts
```

---

### Scripts Endpoints

#### 1. **Create Script**
- **URL**: `/`
- **Method**: `POST`
- **Description**: Creates a new script (Admin only).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Script Name",
    "description": "Description of the script",
    "content": "echo Hello World",
    "language": "bash",
    "tags": ["example", "test"]
  }
  ```
- **Response**:
  - **201**: Script created successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **400**: Validation error.

---

#### 2. **Get All Scripts**
- **URL**: `/`
- **Method**: `GET`
- **Description**: Retrieves all scripts (Admin only).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200**: List of scripts.
  - **401**: Unauthorized.
  - **403**: Forbidden.

---

#### 3. **Get Script By ID**
- **URL**: `/:id`
- **Method**: `GET`
- **Description**: Retrieves a single script by ID (Admin only).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the script to retrieve.
- **Response**:
  - **200**: Script details.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **404**: Script not found.

---

#### 4. **Update Script**
- **URL**: `/:id`
- **Method**: `PUT`
- **Description**: Updates a script by ID (Admin only).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the script to update.
- **Request Body**:
  ```json
  {
    "name": "Updated Script Name",
    "description": "Updated description",
    "content": "updated script content",
    "language": "bash",
    "tags": ["updated", "example"]
  }
  ```
- **Response**:
  - **200**: Script updated successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **404**: Script not found.

---

#### 5. **Delete Script**
- **URL**: `/:id`
- **Method**: `DELETE`
- **Description**: Deletes a script by ID (Admin only).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the script to delete.
- **Response**:
  - **200**: Script deleted successfully.
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **404**: Script not found.

---

#### 6. **Test Script**
- **URL**: `/:id/test`
- **Method**: `POST`
- **Description**: Executes a script in a sandboxed environment for testing purposes.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the script to test.
- **Response**:
  - **200**: Script executed successfully with output.
    ```json
    {
      "stdout": "Hello World",
      "stderr": ""
    }
    ```
  - **401**: Unauthorized.
  - **403**: Forbidden.
  - **404**: Script not found.
  - **500**: Error executing script.
