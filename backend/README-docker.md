# PostgreSQL Docker Setup

This project uses PostgreSQL running in a Docker container for data persistence.

## Prerequisites

- Docker and Docker Compose installed on your system

## Getting Started

### 1. Start PostgreSQL Container

```bash
# Start the PostgreSQL container with data persistence
docker-compose up -d

# Check if the container is running
docker-compose ps
```

### 2. Connect to PostgreSQL

#### Using psql from inside the container:

```bash
# Find the container ID
docker ps

# Connect to psql console
docker exec -it phonebook-postgres psql -U postgres -d phonebook
```

#### Using external psql client:

```bash
psql -h localhost -p 5432 -U postgres -d phonebook
```

Connection details:

- **Host**: localhost
- **Port**: 5432
- **Database**: phonebook
- **Username**: postgres
- **Password**: mysecretpassword

### 3. Stop the Container

```bash
# Stop the container
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data!)
docker-compose down -v
```

## Data Persistence

The PostgreSQL data is persisted using Docker volumes. The data will survive container restarts and removals unless you explicitly remove the volume with `docker-compose down -v`.

## Database Schema

The database is automatically initialized with:

- `users` table for user authentication
- `blogs` table for blog posts
- Proper foreign key relationships and indexes

## Environment Variables

You can customize the database configuration by modifying the environment variables in `docker-compose.yml`:

- `POSTGRES_DB`: Database name (default: phonebook)
- `POSTGRES_USER`: Database user (default: postgres)
- `POSTGRES_PASSWORD`: Database password (default: mysecretpassword)

## Troubleshooting

### Container won't start

- Check if port 5432 is already in use: `netstat -an | findstr 5432`
- Check container logs: `docker-compose logs postgres`

### Connection refused

- Ensure the container is running: `docker-compose ps`
- Check if the database has finished initializing: `docker-compose logs postgres`
