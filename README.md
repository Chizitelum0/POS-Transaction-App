# 🛒 POS Transaction Web App

A lightweight, modern Point of Sale (POS) Web Application built for retail operations. Features cashier authentication, real-time total calculations, daily sales summary reports, and role-based access control (Admin & Cashier).

---

## 🚀 Features

    - **🔐 Authentication & Access Control:**
    - Secure JWT-based login for Cashiers and Admins.
    - Role-based permissions (Admin controls & reporting vs. Cashier checkout interface).
      
    - **🛒 Real-Time POS Terminal:**
    - Item catalog grid with instant search filtering.
    - Dynamic cart management (add, remove, adjust quantities).
    - Automated total price calculation (`₦` NGN currency formatting).

    - **📊 Reporting & Management:**
    - Daily sales metrics (Total Revenue & Transaction Count).
    - Admin panel to create and onboard new cashier accounts.

---

       ## 🛠️ Tech Stack

    - **Frontend:** React.js, Context/State Hooks, Inline Modern UI
    - **Backend:** Node.js, Express.js
    - **Database:** MongoDB / MongoDB Atlas
    - **Security:** JSON Web Tokens (JWT), Password Hashing

---

## 📦 Project Structure

                ```text
                POS-Transaction-App/
                ├── server.js              # Express backend API server
                ├── models/                # MongoDB Mongoose schemas (User, Item, Transaction)
                ├── routes/                # API routes (Auth, Items, Transactions, Reports)
                └── src/
                    └── App.jsx            # Main React POS Terminal component
