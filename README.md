```
   ____
  / ___|_ __ ___  _ __   ___  ___
 | |   | '__/ _ \| '_ \ / _ \/ __|
 | |___| | | (_) | | | | (_) \__ \
  \____|_|  \___/|_| |_|\___/|___/

```

Cronos is a robust and flexible cron job management system designed for developers and administrators to efficiently manage, execute, and monitor cron jobs. This project integrates features like cron logs, webhooks, user management, script execution, and more, using technologies like Docker, Node.js, React, and MongoDB for a seamless experience.

---

## Screenshots
![Dashboard](https://github.com/user-attachments/assets/3ea2a61e-847f-48d1-a561-cb178046ebd5)
![Cron Logs](https://github.com/user-attachments/assets/766af4e6-d7bc-49f3-aba0-6b1391918d01)
![Scripts](https://github.com/user-attachments/assets/2c155655-4c03-45df-ac55-ee69fcdf9688)
![Uswer Management](https://github.com/user-attachments/assets/a37b95ec-0174-4986-bc22-51027362dd9c)




## Features 🚀

### Core Features

- **Cron Job Management**:

  - Create, update, and delete cron jobs with ease.
  - Monitor cron jobs with detailed logs and resource usage.
  - View logs for executed cron jobs, including stdout, stderr, status, and duration.
  - Supports filtering, sorting, and pagination.
  - API Documentation: [Cron Jobs and Logs](CronJobs_API_Documentation.md)

- **Webhooks**:

  - Trigger webhooks for events like job start, success, and failure.
  - Manage webhooks for each cron job with customizable URLs and secrets.
  - API Documentation: [Webhooks](CronJobs_API_Documentation.md#Webhooks-Endpoints)

- **Script Management**:

  - Create, update, and delete scripts.
  - Test scripts in a secure, sandboxed environment using Docker.
  - API Documentation: [Script Management](Scripts_API_Documentation.md)

- **User Management**:
  - Admin and user roles for access control.
  - Secure login with 2FA (Two-Factor Authentication).
  - API Documentation: [Authentication and User Management](User_API_Documentation.md)

---

## Installation 🛠️

**Prerequisites**

- **Node.js**: Ensure you have Node.js installed on your machine.
- **Docker**: Docker is required for script sandboxing.
- **MongoDB**: A running MongoDB instance.


**Development Setup**

1. Clone the repository:
   ```bash
   git clone https://github.com/tedtalksbits/cronos.git
   cd cronos
   ```

**Steps**

Update BRANCH="dev" in the `development.sh` script to the desired branch.

Ensure the scripts are executable:

```bash
chmod +x development.sh
```

Run the development setup script:

```bash
./development.sh
```

This will:

- Pull the latest code.
- Install dependencies for the client and server.
- Build the `script-runner` Docker image.
- Start the server and client in development mode.

---

**ENV Variables**

2. Copy the `.env-example` file to `.env` in the following directories:

- `client`
- `server`

3. Update the values in the `.env` files to match your environment.


## Deployment 🌐

**Prerequisites**

- Ensure the production environment meets the prerequisites listed above.

**Steps**

Update `BRANCH="main"` in the `deployment.sh` script to the desired branch.

Ensure the scripts are executable:

```bash
chmod +x deployment.sh
```

Run the deployment setup script:

```bash
./deployment.sh
```

This will:

- Pull the latest code from the main branch.
- Install and build the client and server.
- Restart/Run services using pm2.

---

## Standing on the Shoulders of Giants 🦸

- **Node.js**: Because, JavaScript.
- **React**: A JavaScript library for building user interfaces.
- **Express**: A fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: A general-purpose, document-based, distributed database.
- **Docker**: A platform for developing, shipping, and running applications in containers.
- **React Query**: A data-fetching library for React.
- **ShadCN**: The best UI library since sliced bread.
- **Node-Cron**: A simple cron-like job scheduler for Node.js.

---

## TODO 📝

- [x] Containerize the application using Docker.
- [ ] Add unit tests for the server and client.
- [ ] Render script test results in the UI.
- [ ] CI/CD: github actions
- [ ] Better Documentation
