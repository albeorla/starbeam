# 💫 Starbeam: Knowledge Management Control Plane

## Project Structure

- `pages/`: Next.js pages
  - `index.tsx`: Main page with URL submission form
  - `api/`: API routes
    - `ingest.ts`: Endpoint for ingesting new links
    - `test-connections.ts`: Endpoint for testing database connections
- `lib/`: Utility functions and shared code
  - `prisma.ts`: Prisma client initialization
- `config/`: Configuration files
  - `aws.ts`: AWS RDS configuration
- `prisma/`: Prisma ORM files
  - `schema.prisma`: Database schema definition
  - `migrations/`: Database migration files
  - `migrate.ts`: Custom migration script

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up your environment variables in a `.env` file:
   ```
   DATABASE_URL=your_rds_connection_string
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   ```

3. Run database migrations:
   ```bash
   bun run db:migrate
   ```

4. Generate Prisma client:
   ```bash
   bun run prisma:generate
   ```

5. Run the development server:
   ```bash
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Database Management

To update your database schema:

1. Modify the `prisma/schema.prisma` file
2. Run the migration command:
   ```bash
   bun run db:migrate
   ```

This command will handle both initial setup and subsequent migrations.

To view and edit your database with Prisma Studio:

## API Routes

- `/api/ingest`: POST endpoint for submitting new URLs
- `/api/test-connections`: GET endpoint for testing database connections

## Running Tests

```bash
bun test
```

## Deployment

(Add deployment instructions here when ready)

## Contributing

(Add contribution guidelines here)

## License

(Add license information here)
