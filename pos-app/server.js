const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');
const Transaction = require('./models/Transaction');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- 1. AUTHENTICATION ROUTE ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (username === "cashier" && password === "1234") {
            return res.json({ success: true, user: { username, role: 'Cashier' } });
        }
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        res.json({ success: true, user: { username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. ITEMS (INVENTORY) ROUTES ---
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items/seed', async (req, res) => {
    try {
        await Item.deleteMany({});
        const defaultItems = [
            { name: 'Bottled Water', price: 200, stock: 50 },
            { name: 'Bread', price: 1000, stock: 20 },
            { name: 'Soft Drink', price: 350, stock: 40 },
            { name: 'Instant Noodles', price: 250, stock: 30 }
        ];
        await Item.insertMany(defaultItems);
        res.json({ message: 'Sample inventory seeded successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. CHECKOUT & TRANSACTIONS ROUTES ---
app.post('/api/transactions', async (req, res) => {
    const { cashierName, items, totalAmount } = req.body;
    try {
        const newTransaction = new Transaction({
            cashierName,
            items,
            totalAmount
        });
        await newTransaction.save();
        res.status(201).json({ success: true, transaction: newTransaction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. REPORTS ROUTE ---
app.get('/api/reports/daily', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayTransactions = await Transaction.find({
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalSales = todayTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);

        res.json({
            date: startOfDay.toDateString(),
            totalTransactions: todayTransactions.length,
            totalRevenue: totalSales,
            transactions: todayTransactions
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- 5, CREATE CHASER CREDENTIALS ---

async function createAdmin() {
    try {
        const existingUser = await User.findOne({ username: 'CHIZITELUM' });
        if (!existingUser) {
            await User.create({
                username: 'CHIZITELUM',
                password: 'pass123',
            });
            console.log('Admin user created successfully!');
        }
    } catch (err) {
        console.error('Error creating admin user:', err);
    }
}

// Call it after connecting to MongoDB
createAdmin();

// --- 6, CREATE ITEMS ---
async function seedItems() {
    try {
        const count = await Item.countDocuments();
        if (count === 0) {
            await Item.insertMany([
                { name: 'Burger', price: 2500 },
                { name: 'Pizza', price: 6000 },
                { name: 'Cold Soda', price: 800 },
                { name: 'Fried Rice', price: 3500 },
            ]);
            console.log('Items seeded successfully!');
        }
    } catch (err) {
        console.error('Error seeding items:', err);
    }
}

// Call it when the server runs
seedItems();

