# Inventory Management System

A full-stack Inventory Management System built with **React (Vite)**, **PHP**, and **MySQL**.

## Prerequisites

1.  **XAMPP** (or any LAMP/WAMP stack) for PHP and MySQL.
2.  **Node.js** (v16+) and **npm** for the React frontend.

## Setup Instructions

### 1. Database Setup

1.  Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
2.  Create a new database named `inventory_db`.
3.  Import the `inventory.sql` file located in this directory.
    *   This will create all necessary tables (`users`, `products`, `stock`, `expenses`, `inventory_logs`) and seed a default Admin user.

### 2. Backend Setup (PHP)

1.  Ensure this project folder (`Rithika`) is accessible by your Apache server.
    *   **Option A**: Move the `backend` folder to `C:\xampp\htdocs\inventory` and update frontend API URL.
    *   **Option B (Recommended for Dev)**: Configure a Virtual Host or simply ensure `http://localhost/api` points to `C:\Users\sanja\OneDrive\Desktop\Rithika\backend\api`.
    *   **Simplest Method**: If you are just testing, copy the entire `backend` folder to `C:\xampp\htdocs\api`.
        *   Resulting URL should be: `http://localhost/api/auth/login.php`.
2.  **Configuration**:
    *   Check `backend/api/config/database.php` to ensure DB credentials match your XAMPP setup (Default: `root`, no password).

### 3. Frontend Setup (React)

1.  Open a terminal in the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

*   **Email**: `admin@example.com`
*   **Password**: `admin123`

## Directory Structure

*   `backend/api`: PHP API endpoints.
*   `frontend/src`: React source code.
*   `inventory.sql`: Database schema.

## Features

*   **Admin Dashboard**: Manage Employees, Stock, Expenses, Reports.
*   **Employee Dashboard**: specific operational views (In Progress).
*   **Authentication**: JWT-based secure login.
*   **Audit Logging**: Tracks every stock change in `inventory_logs`.
