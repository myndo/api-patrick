

### 2. Configure Database Connection

Create a `.env` file in the root directory (see [Environment Configuration](#environment-configuration) below).

### 3. Generate Prisma Client and Push Schema

```bash

# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

```

### Getting API Credentials

#### Shopify Setup

1. Go to your Shopify Admin Panel
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Create a new app or select an existing one
4. Configure Admin API scopes (read_products, write_products, read_orders, etc.)
5. Install the app to your store
6. Copy the **API Key** and **API Secret Token** (Admin API access token)

#### Google Search Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Search Console API**
4. Go to **APIs & Services** → **Credentials**
5. Create **OAuth 2.0 Client ID** (Web application)
6. Add authorized redirect URI: `http://localhost:8000/oauth2callback`
7. Copy **Client ID** and **Client Secret**


### Development Mode

```bash
# Watch mode with hot reload
npm run dev

# Or with pnpm
pnpm run dev
```

The API will be available at `http://localhost:8000`

### Production Mode

```bash
# Build the application
npm run build

```

## 🔌 API Integrations

### RTBHouse Integration

Fetch and store advertising campaign metrics.

**Endpoint:** `POST /api/v1/jobs/fetch-rtbhouse`

**Request Body:**
```json
{
  "dayFrom": "2026-01-01",
  "dayTo": "2026-01-31",
  "credentials": {
    "username": "your_rtbhouse_username",
    "password": "your_rtbhouse_password"
  }
}
```

**Response:**
```json
{
  "message": "RTBHouse data fetched and saved successfully",
  "saved": 150
}
```

### Shopify Integration

Manage products, orders, and customers.

**Available Endpoints:**
- `POST /api/v1/shopify/products` - List all products
- `POST /api/v1/shopify/products/by-id` - Get product by ID
- `POST /api/v1/shopify/products/search` - Search products
- `POST /api/v1/shopify/orders` - List orders
- `POST /api/v1/shopify/customers` - List customers
- `POST /api/v1/shopify/shop-info` - Get shop information
- `POST /api/v1/shopify/products/count` - Get product count
- `POST /api/v1/shopify/orders/count` - Get order count
- `POST /api/v1/shopify/customers/count` - Get customer count

**Example Request:**
```json
{
  "shop": "your-store-name.myshopify.com",
  "accessToken": "shpat_xxxxxxxxxxxxx"
}
```

### Google Search Console Integration

#### Step 1: Get Authorization URL

**Endpoint:** `GET /api/v1/google-search-console/auth-url`

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### Step 2: Authorize Application

1. Visit the `authUrl` in your browser
2. Sign in with your Google account
3. Grant permissions to the application
4. You'll be redirected to `http://localhost:8000/oauth2callback`
5. Copy the tokens from the response

**OAuth Callback Response:**
```json
{
  "accessToken": "ya29.a0AfH6SMBx...",
  "refreshToken": "1//0gL4xY...",
  "expiresIn": 3599,
  "tokenType": "Bearer",
  "scope": "https://www.googleapis.com/auth/webmasters.readonly"
}
```

#### Step 3: Use Access Token

**Available Endpoints:**
- `POST /api/v1/google-search-console/sites` - List verified sites
- `POST /api/v1/google-search-console/analytics` - Get search analytics
- `POST /api/v1/google-search-console/top-queries` - Get top search queries
- `POST /api/v1/google-search-console/top-pages` - Get top pages
- `POST /api/v1/google-search-console/performance-by-country` - Performance by country
- `POST /api/v1/google-search-console/performance-by-device` - Performance by device
- `POST /api/v1/google-search-console/total-stats` - Get total statistics
- `POST /api/v1/google-search-console/sitemaps` - List sitemaps
- `POST /api/v1/google-search-console/submit-sitemap` - Submit sitemap
- `DELETE /api/v1/google-search-console/delete-sitemap` - Delete sitemap

**Example Request (Top Queries):**
```json
{
  "siteUrl": "https://myndo.it",
  "accessToken": "ya29.a0AfH6SMBx...",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31"
}
```

**Example Response:**
```json
{
  "queries": [
    {
      "query": "your search term",
      "clicks": 150,
      "impressions": 2500,
      "ctr": 0.06,
      "position": 5.2
    }
  ]
}
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npm run db:generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Shopify Errors

**Error:** "Missing adapter implementation"
- **Solution:** Ensure `@shopify/shopify-api/adapters/node` is imported in `shopify-service-adapter.ts`

**Error:** "Invalid shop domain"
- **Solution:** Use format `your-store-name.myshopify.com` (not custom domain)
- Example: ✅ `mystore.myshopify.com` ❌ `www.mystore.com`

**Error:** "Invalid access token"
- **Solution:** Generate new Admin API access token from Shopify Admin → Apps
- Token should start with `shpat_`

### Google OAuth Errors

**Error:** "redirect_uri_mismatch"
- **Solution:** Add `http://localhost:8000/oauth2callback` to Google Cloud Console OAuth credentials under "Authorized redirect URIs"

**Error:** "Cannot GET /oauth2callback"
- **Solution:** Ensure `OAuthModule` is imported in `app.module.ts` and server is running

**Error:** "invalid_grant" when using refresh token
- **Solution:** Tokens expire - get new authorization by visiting auth URL again

### Port Already in Use

```bash
# Find process using port 8000
lsof -ti:8000

# Kill process
kill -9 $(lsof -ti:8000)

# Or change port in .env
PORT=3000
```

### Build Errors

```bash
# Clean build directory
rm -rf dist/

# Reinstall dependencies
rm -rf node_modules/
npm install

# Rebuild
npm run build
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Shopify API Documentation](https://shopify.dev/docs/api)
- [Google Search Console API](https://developers.google.com/webmaster-tools/search-console-api-original)
- [RTBHouse API Documentation](https://api.rtbhouse.com/docs/)

## 📝 Project Structure

```
vedcausa-api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
├── src/
│   ├── app.module.ts          # Root module
│   ├── main.ts                # Application entry point
│   ├── app/
│   │   ├── config/            # Configuration files
│   │   ├── database/          # Database service
│   │   └── utils/             # Utility functions
│   └── modules/
│       ├── contributors/      # Contributors module
│       ├── integrations/      # Third-party integrations
│       ├── job/               # Job/Campaign management
│       ├── oauth/             # OAuth callback handler
│       ├── organizations/     # Organizations module
│       ├── profiles/          # User profiles
│       ├── shopify/           # Shopify integration
│       ├── google-search-console/  # GSC integration
│       ├── uploads/           # File uploads
│       └── users/             # User management
├── test/                      # E2E tests
├── .env                       # Environment variables
├── package.json               # Dependencies
└── README.md                  # This file
```

