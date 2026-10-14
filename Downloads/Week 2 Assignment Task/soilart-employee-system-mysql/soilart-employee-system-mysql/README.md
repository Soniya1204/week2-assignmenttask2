# SoilArt - Employee & Artisan Management System

Full-stack CRUD web application built with HTML/CSS/JavaScript (Frontend), Express.js Node.js (Backend), and MySQL (Database).

## Setup Instructions

### 1. Database Setup (MySQL)
1. Open XAMPP Control Panel or MySQL Command Line.
2. Import/Run `backend/schema.sql` to create `soilart_db` and the `employees` table.

### 2. Backend API Setup
1. Navigate to `backend/` in your terminal:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. The server will run at `http://localhost:5000`.

### 3. Frontend Setup
1. Open `frontend/index.html` in your browser.
2. Test adding, updating, and deleting staff records!

### 4. Postman API Testing
1. Import `SoilArt_Postman_Collection.json` into Postman or Thunder Client.
2. Test GET, POST, PUT, DELETE requests.
