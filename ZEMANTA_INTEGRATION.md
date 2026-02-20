# Zemanta (Teads DSP) API Integration - Complete Guide

## Overview

This integration provides a comprehensive solution for managing advertising accounts on the Zemanta/Teads DSP platform using their REST API. The integration uses OAuth2 client credentials flow for authentication and supports all account management operations.

## Authentication

### Credentials Setup

1. **Get Client Credentials:**
   - Visit: https://dsp.outbrain.com/o/applications/
   - Click "New Application"
   - Enter application name and save
   - Copy the Client ID and Client Secret

2. **Add to Environment Variables:**
   ```env
   ZEMANTA_CLIENT_ID=hlOtjtxcKxYMBfuy0Jzl4DTeOaSfnfMwqHdPLQsr
   ZEMANTA_CLIENT_SECRET=FJiXyc0eqsdb0Bb1LX6YkoiyMAZ1bmvAqCRNhtAKPNfQM8Kr5l2NbjjGuihrqYpv9mhLpZiC6Iurp94su1ER4CIEV3czUWtcydINmuBUhFjTkqjqfRef6RWVCYEuzd6U
   ```

### OAuth2 Client Credentials Flow

The adapter automatically handles:
- Token acquisition using Basic Authentication
- Token caching (valid for 10 hours)
- Automatic token refresh when expired
- Bearer token injection in all API requests

## Architecture

### File Structure

```
src/
├── modules/
│   ├── integrations/
│   │   └── zemanta-adapter.ts       # API client with OAuth2
│   └── zemanta/
│       ├── zemanta.controller.ts    # REST endpoints
│       ├── zemanta.service.ts       # Business logic
│       ├── zemanta.dto.ts           # Request/response validation
│       └── zemanta.module.ts        # NestJS module
└── app.module.ts                    # Module registration
```

### Components

#### 1. ZemantaAdapter (`zemanta-adapter.ts`)

Low-level API client that handles:
- OAuth2 authentication with automatic token management
- HTTP requests to Zemanta API (https://oneapi.zemanta.com)
- TypeScript interfaces for all API entities

**Key Methods:**
- `getAccessToken()` - Acquires and caches OAuth2 token
- `listAccounts()` - Fetch all accounts
- `getAccountDetails()` - Get single account
- `updateAccount()` - Update account settings
- `createAccount()` - Create new account
- `getAccountSources()` - Get available media sources
- `getAccountCredits()` - Get credit/budget information
- `getAccountCreditDetails()` - Get specific credit details

#### 2. ZemantaService (`zemanta.service.ts`)

Business logic layer that:
- Initializes adapter with environment credentials
- Wraps adapter calls with error handling
- Formats responses for controllers
- Throws NestJS HttpException on errors

#### 3. ZemantaController (`zemanta.controller.ts`)

REST API endpoints:
- Handles HTTP requests/responses
- Validates input with DTOs
- Returns standardized responses using `reply()` utility

#### 4. DTOs (`zemanta.dto.ts`)

Request validation classes using class-validator:
- `ListAccountsDto` - Query params for listing accounts
- `GetAccountDetailsDto` - Account ID with options
- `UpdateAccountDto` - Partial account updates
- `CreateAccountDto` - New account creation
- `GetAccountCreditsDto` - Credit retrieval
- `GetAccountCreditDetailsDto` - Specific credit details

## API Endpoints

### Base URL
`http://localhost:8000/api/v1/zemanta`

### 1. List Accounts
```http
GET /api/v1/zemanta/accounts?includeArchived=false&includeDeliveryStatus=true
```

**Query Parameters:**
- `includeArchived` (boolean, optional): Include archived accounts (default: false)
- `includeDeliveryStatus` (boolean, optional): Include delivery status (default: false)

**Response:**
```json
{
  "accounts": [
    {
      "id": "186",
      "agencyId": "1",
      "name": "My Account 1",
      "targeting": {
        "publisherGroups": {
          "included": ["153"],
          "excluded": ["154"]
        }
      },
      "frequencyCapping": 10,
      "deliveryStatus": "ACTIVE",
      "currency": "USD"
    }
  ],
  "message": "Accounts retrieved successfully"
}
```

### 2. Get Account Details
```http
GET /api/v1/zemanta/accounts/186?includeDeliveryStatus=true
```

**URL Parameters:**
- `accountId` (string, required): Account ID

**Query Parameters:**
- `includeDeliveryStatus` (boolean, optional): Include delivery status

**Response:**
```json
{
  "account": {
    "id": "186",
    "agencyId": "1",
    "name": "My Account 1",
    "archived": false,
    "targeting": {
      "publisherGroups": {
        "included": ["153"],
        "excluded": ["154"]
      }
    },
    "frequencyCapping": 10,
    "deliveryStatus": "ACTIVE"
  },
  "message": "Account details retrieved successfully"
}
```

### 3. Update Account
```http
PUT /api/v1/zemanta/accounts/186
Content-Type: application/json

{
  "name": "Updated Account Name",
  "frequencyCapping": 15,
  "targeting": {
    "publisherGroups": {
      "included": ["153", "155"],
      "excluded": ["154"]
    }
  }
}
```

**URL Parameters:**
- `accountId` (string, required): Account ID

**Request Body:**
- `name` (string, optional): Account name
- `archived` (boolean, optional): Archive status
- `targeting` (object, optional): Targeting settings
- `frequencyCapping` (number, optional): Max impressions per user per day
- `defaultIconUrl` (string, optional): Brand logo URL
- `defaultBrandName` (string, optional): Brand name

**Response:**
```json
{
  "account": {
    "id": "186",
    "name": "Updated Account Name",
    "frequencyCapping": 15
  },
  "message": "Account updated successfully"
}
```

### 4. Create Account
```http
POST /api/v1/zemanta/accounts
Content-Type: application/json

{
  "name": "New Campaign Account",
  "agencyId": "1",
  "currency": "USD",
  "frequencyCapping": 10,
  "defaultBrandName": "My Brand",
  "defaultIconUrl": "https://example.com/logo.png",
  "inventoryAccessLevel": "EXPANDED"
}
```

**Request Body:**
- `name` (string, required): Account name
- `agencyId` (string, required): Agency ID
- `currency` (string, optional): Currency code (USD, EUR, GBP, etc.)
- `frequencyCapping` (number, optional): Max impressions per user per day
- `defaultBrandName` (string, optional): Brand name
- `defaultIconUrl` (string, optional): Brand logo URL (min 128x128px, square)
- `inventoryAccessLevel` (string, optional): EXPANDED, STANDARD, or LIMITED

**Response:**
```json
{
  "account": {
    "id": "187",
    "agencyId": "1",
    "name": "New Campaign Account",
    "currency": "USD",
    "inventoryAccessLevel": "EXPANDED"
  },
  "message": "Account created successfully"
}
```

### 5. Get Account Sources
```http
GET /api/v1/zemanta/accounts/186/sources
```

**URL Parameters:**
- `accountId` (string, required): Account ID

**Response:**
```json
{
  "sources": [
    {
      "slug": "outbrainrtb",
      "name": "Outbrain RTB",
      "auditors": ["OUTBRAIN"]
    },
    {
      "slug": "gumgum",
      "name": "GumGum",
      "auditors": ["OUTBRAIN"]
    }
  ],
  "message": "Account sources retrieved successfully"
}
```

### 6. Get Account Credits
```http
GET /api/v1/zemanta/accounts/186/credits
```

**URL Parameters:**
- `accountId` (string, required): Account ID

**Response:**
```json
{
  "credits": [
    {
      "id": "861",
      "startDate": "2026-01-01",
      "endDate": "2026-11-05",
      "createdOn": "2024-06-04",
      "total": "1000.0000",
      "allocated": "400.0000",
      "available": "600.0000",
      "currency": "EUR"
    }
  ],
  "message": "Account credits retrieved successfully"
}
```

### 7. Get Credit Details
```http
GET /api/v1/zemanta/accounts/186/credits/861
```

**URL Parameters:**
- `accountId` (string, required): Account ID
- `creditId` (string, required): Credit ID

**Response:**
```json
{
  "credit": {
    "id": "861",
    "startDate": "2026-01-01",
    "endDate": "2026-11-05",
    "createdOn": "2024-06-04",
    "total": "1000.0000",
    "allocated": "400.0000",
    "available": "600.0000",
    "currency": "EUR"
  },
  "message": "Credit details retrieved successfully"
}
```

## Data Models

### Account
```typescript
{
  id: string;                  // Account ID
  agencyId: string;            // Parent agency ID
  name: string;                // Account name
  archived?: boolean;          // Archive status
  targeting?: {
    publisherGroups?: {
      included?: string[];     // Included publisher group IDs
      excluded?: string[];     // Excluded publisher group IDs
    };
    keywordLists?: {
      excluded?: string[];     // Excluded keyword list IDs
    };
  };
  currency?: string;           // USD, EUR, GBP, etc.
  frequencyCapping?: number;   // Max ads per user per day
  defaultIconUrl?: string;     // Brand logo URL
  defaultBrandName?: string;   // Brand name
  deliveryStatus?: string;     // ACTIVE, INACTIVE, STOPPED, DISABLED
  inventoryAccessLevel?: string; // EXPANDED, STANDARD, LIMITED
}
```

### Credit Item
```typescript
{
  id: string;           // Credit ID
  startDate: string;    // Start date (YYYY-MM-DD)
  endDate: string;      // End date (YYYY-MM-DD)
  createdOn: string;    // Creation date
  total: string;        // Total credit amount (decimal string)
  allocated: string;    // Amount allocated to campaigns
  available: string;    // Amount still available
  currency: string;     // Currency code
}
```

### Source
```typescript
{
  slug: string;         // Source identifier
  name: string;         // Display name
  auditors: string[];   // List of auditors (e.g., ["OUTBRAIN"])
}
```

## Error Handling

All endpoints use consistent error handling:

```json
{
  "statusCode": 500,
  "message": "Failed to list accounts: Authentication failed",
  "error": "Internal Server Error"
}
```

Common error scenarios:
- **401 Unauthorized**: Invalid or expired credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Account/credit not found
- **400 Bad Request**: Invalid request parameters
- **500 Internal Server Error**: API or network errors

## Testing

Use the provided `test-zemanta.http` file with REST Client extension in VS Code:

```bash
# Start the development server
npm run dev

# Open test-zemanta.http and click "Send Request" above each endpoint
```

Test files included:
- `test-zemanta.http` - All account management endpoints with examples

## Environment Configuration

Add to `.env`:
```env
# Zemanta (Teads DSP) API Credentials
ZEMANTA_CLIENT_ID=your_client_id_here
ZEMANTA_CLIENT_SECRET=your_client_secret_here
```

## Build and Deployment

```bash
# Build for production
npm run build

# The compiled output will be in dist/
# Deploy dist/ to your production server
```

## Additional Features

### Automatic Token Management
- Tokens are cached in memory
- Automatic renewal before expiration (10 hours validity)
- No manual token refresh required

### Type Safety
- Full TypeScript support
- Interfaces for all API entities
- Compile-time validation

### Validation
- Request validation using class-validator
- DTOs for all endpoints
- Proper error messages for invalid inputs

## Zemanta API Documentation

Full API reference: https://dev.zemanta.com/one/api/

## Support

For issues or questions:
1. Check Zemanta API documentation
2. Verify credentials and permissions
3. Check application logs for detailed error messages
4. Contact Teads DSP support: https://intercom.help/outbrain_dsp/

## Campaign Management

The integration also supports campaign management operations including budget and performance tracking.

### 8. List Campaigns
```http
# List campaigns without stats
GET /api/v1/zemanta/campaigns?includeArchived=false&includeGoals=true&includeBudgets=true&accountId=186

# List campaigns with stats for each campaign
GET /api/v1/zemanta/campaigns?includeArchived=false&includeBudgets=true&from=2026-01-01&to=2026-01-31
```

**Query Parameters:**
- `includeArchived` (boolean, optional) - Include archived campaigns (default: false)
- `includeGoals` (boolean, optional) - Include campaign goals (default: false)
- `includeBudgets` (boolean, optional) - Include campaign budgets (default: false)
- `includeDeliveryStatus` (boolean, optional) - Include delivery status (default: false)
- `accountId` (string, optional) - Filter by specific account ID
- `excludeInactive` (boolean, optional) - Exclude inactive campaigns (default: false)
- `from` (string, optional) - Start date (YYYY-MM-DD format). If provided with `to`, includes performance stats for each campaign
- `to` (string, optional) - End date (YYYY-MM-DD format). If provided with `from`, includes performance stats for each campaign

**Response (with stats when from/to provided):**
```json
{
  "campaigns": [
    {
      "id": "608",
      "accountId": "186",
      "campaignManager": "test@test.com",
      "name": "My Campaign 1",
      "archived": false,
      "iabCategory": "IAB1_1",
      "tracking": {},
      "targeting": {},
      "frequencyCapping": 10,
      "deliveryStatus": "ACTIVE",
      "goals": [
        {
          "id": "1238",
          "type": "TIME_ON_SITE",
          "value": "60",
          "primary": true,
          "conversionGoal": {
            "type": "PIXEL",
            "name": "My conversion goal",
            "goalId": "123",
            "conversionDefinitionId": "123"
          }
        }
      ],
      "budgets": [
        {
          "id": "1910",
          "creditId": "861",
          "amount": "400",
          "margin": "0.1",
          "comment": "my budget",
          "startDate": "2026-01-01",
          "endDate": "2026-01-31",
          "state": "ACTIVE",
          "spend": "0.0000",
          "available": "400.0000"
        }
      ],
      "stats": {
        "totalCost": "2240.56",
        "impressions": 4146083,
        "clicks": 14621,
        "cpc": "0.130"
      }
    }
  ],
  "message": "Campaigns retrieved successfully"
}
```

**Note:** The `stats` field is only included when both `from` and `to` query parameters are provided.

### 9. Get Campaign Details (Budgets and Stats)
```http
# Get budgets only
GET /api/v1/zemanta/campaigns/608

# Get budgets and stats
GET /api/v1/zemanta/campaigns/608?from=2026-01-01&to=2026-01-31
```

**Path Parameters:**
- `campaignId` (string, required) - Campaign ID

**Query Parameters:**
- `from` (string, optional) - Start date (YYYY-MM-DD format). If provided with `to`, includes performance stats
- `to` (string, optional) - End date (YYYY-MM-DD format). If provided with `from`, includes performance stats

**Response (with stats):**
```json
{
  "data": {
    "budgets": [
      {
        "id": "1910",
        "creditId": "861",
        "amount": "400",
        "margin": "0.1",
        "comment": "my budget",
        "startDate": "2026-01-01",
        "endDate": "2026-01-31",
        "state": "ACTIVE",
        "spend": "0.0000",
        "available": "400.0000"
      }
    ],
    "stats": {
      "totalCost": "2240.56",
      "impressions": 4146083,
      "clicks": 14621,
      "cpc": "0.130"
    }
  },
  "message": "Campaign details retrieved successfully"
}
```

**Response (budgets only, no date range):**
```json
{
  "data": {
    "budgets": [
      {
        "id": "1910",
        "creditId": "861",
        "amount": "400",
        "margin": "0.1",
        "comment": "my budget",
        "startDate": "2026-01-01",
        "endDate": "2026-01-31",
        "state": "ACTIVE",
        "spend": "0.0000",
        "available": "400.0000"
      }
    ]
  },
  "message": "Campaign details retrieved successfully"
}
```

## Future Enhancements

Potential additions:
- Campaign CRUD operations (create, update, delete)
- Ad group operations
- Creative management
- Budget management endpoints
- Advanced reporting
- Real-time statistics
- Publisher management
- Deal management
