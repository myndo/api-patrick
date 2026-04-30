

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


