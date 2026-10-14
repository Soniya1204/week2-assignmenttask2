CREATE DATABASE IF NOT EXISTS soilart_db;
USE soilart_db;

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    division VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    join_date DATE NOT NULL,
    status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO employees (id, name, phone, email, division, role, salary, join_date, status) VALUES
('SA-101', 'Aarav Sharma', '9876543210', 'aarav@soilart.in', 'Pottery & Clay Shaping', 'Master Clay Sculptor', 45000.00, '2022-03-15', 'Active'),
('SA-102', 'Priya Patel', '9823012345', 'priya@soilart.in', 'Glazing & Design Studio', 'Ceramic Designer', 38000.00, '2022-07-10', 'Active'),
('SA-103', 'Rajesh Kumar', '9123456789', 'rajesh@soilart.in', 'Kiln & Firing Division', 'Kiln Operator', 32000.00, '2021-11-01', 'Active');
