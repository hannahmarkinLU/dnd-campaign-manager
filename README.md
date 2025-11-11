# D&D Campaign Organizer API

A REST API for managing and organizing Dungeons & Dragons campaigns.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create the database:
    ```bash
    npm run setup
    ```

3. Seed with sample data:
    ```bash
    npm run seed
    ```

4. Start the server:
    ```bash
    npm start
    ```


## API Endpoints

### Campaigns

- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Characters

- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get character by ID
- `POST /api/characters` - Create character
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

### Sessions

- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

## Project Structure

```plaintext
task-management-api/
├── database/
│   ├── setup.js    # Database setup and models
│   └── seed.js     # Sample data
├── server.js       # Main server file
├── package.json    # Dependencies
├── .env            # Environment variables
└── README.md       # This file
```