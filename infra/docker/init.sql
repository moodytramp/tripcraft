-- Create separate databases for each service
CREATE DATABASE tripcraft_users;
CREATE DATABASE tripcraft_destinations;

GRANT ALL PRIVILEGES ON DATABASE tripcraft_users TO tripcraft;
GRANT ALL PRIVILEGES ON DATABASE tripcraft_destinations TO tripcraft;
