# API Documentation: Authentication and User Management

## Base URL

```
/api/auth
```

---

### Authentication Endpoints

#### 1. **Login**

- **URL**: `/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "token": "OTP_CODE"
  }
  ```
- **Response**:
  - **200**: Successfully logged in.
  - **401**: Invalid credentials.

---

#### 2. **Register**

- **URL**: `/register`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "1234567890"
  }
  ```
- **Response**:
  - **201**: User registered successfully.
  - **400**: Validation error.

---

#### 3. **Approve User**

- **URL**: `/approve/:userId`
- **Method**: `GET`
- **Description**: Approves a pending user (admin action).
- **Parameters**:
  - `userId`: The ID of the user to approve.
- **Response**:
  - **200**: User approved successfully.
  - **404**: User not found.

---

#### 4. **Who Am I**

- **URL**: `/whoami`
- **Method**: `GET`
- **Description**: Retrieves information about the currently authenticated user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200**: User details.
  - **401**: Unauthorized.

---

#### 5. **Logout**

- **URL**: `/logout`
- **Method**: `GET`
- **Description**: Logs out the user by invalidating the session or token.
- **Response**:
  - **200**: Successfully logged out.

---

#### 6. **Verify Email**

- **URL**: `/verify-email/:userId`
- **Method**: `GET`
- **Description**: Verifies the email address of a user.
- **Parameters**:
  - `userId`: The ID of the user to verify.
- **Response**:
  - **200**: Email verified successfully.
  - **404**: User not found.

---

#### 7. **Send Verification Email**

- **URL**: `/verify-email`
- **Method**: `POST`
- **Description**: Sends a verification email to a user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  - **200**: Verification email sent.
  - **401**: Unauthorized.

---

### User Management Endpoints

#### 1. **Create User**

- **URL**: `/users`
- **Method**: `POST`
- **Description**: Creates a new user (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "password": "securepassword",
    "role": "User"
  }
  ```
- **Response**:
  - **201**: User created successfully.
  - **400**: Validation error.

---

#### 2. **Get Users**

- **URL**: `/users`
- **Method**: `GET`
- **Description**: Retrieves a list of all users (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200**: List of users.

---

#### 3. **Get User By ID**

- **URL**: `/users/:id`
- **Method**: `GET`
- **Description**: Retrieves details of a specific user by ID.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the user to retrieve.
- **Response**:
  - **200**: User details.
  - **404**: User not found.

---

#### 4. **Update User**

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Description**: Updates the details of a user (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the user to update.
- **Request Body**:
  ```json
  {
    "firstName": "UpdatedFirstName",
    "lastName": "UpdatedLastName",
    "email": "updated.email@example.com",
    "status": "Active"
  }
  ```
- **Response**:
  - **200**: User updated successfully.
  - **404**: User not found.

---

#### 5. **Delete User**

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Description**: Deletes a user by ID (admin action).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the user to delete.
- **Response**:
  - **200**: User deleted successfully.
  - **404**: User not found.

---

### OTP Endpoints

#### 1. **Generate OTP**

- **URL**: `/otp`
- **Method**: `POST`
- **Description**: Generates an OTP for a user.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  - **200**: OTP generated successfully.
  - **404**: User not found.

---

#### 2. **Verify OTP**

- **URL**: `/otp/verify`
- **Method**: `POST`
- **Description**: Verifies an OTP for a user.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response**:
  - **200**: OTP verified successfully.
  - **400**: Invalid OTP.
