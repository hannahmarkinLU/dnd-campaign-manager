# D&D Campaign Organizer API

A REST API for managing and organizing Dungeons & Dragons campaigns, characters, and sessions, featuring full JWT authentication, role-based authorization, input validation, and secure resource ownership controls.

## Project Structure

```plaintext
dnd-campaign-api/
├── database/
│   ├── setup.js                # Sequelize models, associations, and DB initialization
│   └── seed.js                 # Seed script for inserting sample data
│
├── middleware/
│   ├── auth.js                 # JWT verification, requireAuth middleware
│   ├── authHelper.js           # RBAC logic: ownership checks, DM verification
│   ├── permissions.js          # Permission helpers for roles/resources
│   ├── validate.js             # Validation result handler (express-validator)
│
├── routes/                     # Route definitions for each resource
│   ├── auth.js                 # Registration, login, and auth token routes
│   ├── campaigns.js            # CRUD routes for campaigns + authorization enforcement
│   ├── characters.js           # CRUD routes for characters + ownership checks
│   └── sessions.js             # CRUD routes for sessions tied to campaign DM access
│
├── tests/                      # Jest + Supertest test suite
│   ├── auth.test.js            # Auth & JWT tests
│   ├── campaigns.test.js       # Campaign CRUD + RBAC tests
│   ├── characters.test.js      # Character CRUD + ownership tests
│   └── sessions.test.js        # Session CRUD + DM authorization tests
│
├── validators/                 # Input validation (express-validator)
│   ├── authValidators.js       # Registration/login validation rules
│   ├── campaignValidators.js   # Campaign creation/update validation
│   ├── characterValidators.js  # Character creation/update validation
│   └── sessionValidators.js    # Session creation/update validation
│
├── server.js                   # Main server file
├── setupTests.js               # Prepares clean test environment
├── package.json                # Project metadata, scripts, and dependencies
├── .env                        # Environment variables (JWT secret, DB URL, etc.)
└── README.md                   # This file
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/dnd-campaign-api.git
   ```
   ```bash
   cd dnd-campaign-api
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a .env file:
    ```bash
    JWT_SECRET=your-secret-key
    NODE_ENV=development
    DATABASE_URL=sqlite:./database.sqlite
    ```
    For Rendor deployment:
    ```bash
    DATABASE_URL=postgres://user:password@host:port/dbname
    ```
4. Run database migration/seed (if applicable):
    ```bash
    node database/seed.js
    ```
5. Start the server:
    ```bash
    npm start
    ```
    Server runs by default at:
    ```bash
    http://localhost:3000
    ```

## Authentication

This API uses JWT tokens.
Include the token in all protected routes:
```bash
Authorization: Bearer <token>
```
Roles:
- **Players**: limited CRUD
- **DMs**: full CRUD, campaign ownership, and session management

## API Documentation

### Base URLs

Local:
```bash
http://localhost:3000
```

Production:
```bash
https://<your-render-app>.onrender.com
```

### Auth Routes

| Method | Endpoint       | Description        | Access              |
| ------ | -------------- | ------------------ | ------------------- |
| POST   | /register      | Registers new user | Public              |
| POST   | /login         |                    | Player or DM        |

### Campaign Routes

| Method | Endpoint       | Description        | Access              |
| ------ | -------------- | ------------------ | ------------------- |
| GET    | /campaigns     | Get all campaigns  | Player or DM        |
| GET    | /campaigns/:id | Get campaign by ID | Player or DM        |
| POST   | /campaigns     | Create campaign    | DM only             |
| PUT    | /campaigns/:id | Update campaign    | DM of campaign only |
| DELETE | /campaigns/:id | Delete campaign    | DM of campaign only |

### Character Routes

| Method | Endpoint        | Description           | Access       |
| ------ | --------------- | --------------------- | ------------ |
| GET    | /characters     | Get user’s characters | Player or DM |
| GET    | /characters/:id | Get character by ID   | Player or DM |
| POST   | /characters     | Create character      | Player or DM |
| PUT    | /characters/:id | Update character      | Owner or DM  |
| DELETE | /characters/:id | Delete character      | Owner or DM  |

### Sessions

| Method | Endpoint      | Description      | Access           |
| ------ | ------------- | ---------------- | ---------------- |
| GET    | /sessions     | Get all sessions | Player or DM     |
| GET    | /sessions/:id | Get session      | Player or DM     |
| POST   | /sessions     | Create session   | Campaign DM only |
| PUT    | /sessions/:id | Update session   | Campaign DM only |
| DELETE | /sessions/:id | Delete session   | Campaign DM only |

## Input Validation

Handled with **express-validator:**
- Required fields
- Minimum lengths
- Numeric checks
- ID validation
- Username/password checks

## Security and Authorization

**Ownership Rules:**
- A DM can only edit campaigns they created (dmId check)
- A player can only edit their own characters
- Sessions can only be modified by the DM of the associated campaign

**Additional Security:**
- Sanitizing user input
- Verifying resources IDs exist
- JWT expiration enforcement
- Central error handling middleware

## Running Tests

Unit tests use Jest + Supertest.

Run Jest tests:
```bash
npm test
```

## Deployment
This API is ready to deploy to cloud platforms like Render. Make sure to:
- Set appropriate environment variables
- Use a secure JWT secret in production
- Consider database limitations with SQLite