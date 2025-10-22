-- Exercise 13.2: Create blogs table and insert sample data

-- Note: The blogs table was already created by Sequelize with additional columns:
-- CREATE TABLE blogs (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     author VARCHAR(255) NOT NULL,
--     url VARCHAR(255) NOT NULL,
--     likes INTEGER DEFAULT 0,
--     user_id INTEGER REFERENCES users(id),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Insert sample blogs
--  docker exec -it phonebook-postgres psql -U postgres -d phonebook -c "INSERT INTO blogs (author, url, title, likes) VALUES ('Dan Abramov', 'https://overreacted.io/on-let-vs-const/', 'On let vs const', 0), ('Laurenz Albe', 'https://www.cybertec-postgresql.com/en/gaps-in-sequences-postgresql/', 'Gaps in sequences in PostgreSQL', 0);"

-- Query to verify the data
-- docker exec -it phonebook-postgres psql -U postgres -d phonebook -c "SELECT * FROM blogs;"