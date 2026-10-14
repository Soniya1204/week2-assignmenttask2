const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Pool Configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'soilart_db',
    waitForConnections: true,
    connectionLimit: 10
});

// 1. GET ALL EMPLOYEES (READ)
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. POST ADD NEW EMPLOYEE (CREATE)
app.post('/api/employees', async (req, res) => {
    const { name, phone, email, division, role, salary, joinDate, status } = req.body;
    const id = `SA-${Math.floor(100 + Math.random() * 900)}`;

    try {
        const query = `INSERT INTO employees (id, name, phone, email, division, role, salary, join_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [id, name, phone, email, division, role, salary, joinDate, status || 'Active']);
        res.status(201).json({ success: true, message: 'Employee added successfully', data: { id, ...req.body } });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 3. PUT UPDATE EMPLOYEE (UPDATE)
app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, division, role, salary, joinDate, status } = req.body;

    try {
        const query = `UPDATE employees SET name=?, phone=?, email=?, division=?, role=?, salary=?, join_date=?, status=? WHERE id=?`;
        const [result] = await pool.query(query, [name, phone, email, division, role, salary, joinDate, status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, message: 'Employee updated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 4. DELETE EMPLOYEE (DELETE)
app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SoilArt Express API Server running on port ${PORT}`));
