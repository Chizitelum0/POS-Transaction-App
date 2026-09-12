const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');
const Transaction = require('./models/Transaction');

const app = express();

app.use(express.json());
app.use(cors());


// ---  DATABASE CONNECTION ---//

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
        console.error('ERROR: MONGO_URI environment variable is missing.');
        process.exit(1);
}


// --- 1. AUTHENTICATION ROUTE --- //

app.post('/api/auth/login', async (req, res) => {
        const { username, password } = req.body;

        try {
                // Existing cashier login
                if (username === 'cashier' && password === '1234') {
                        return res.json({
                                success: true,
                                user: {
                                        username,
                                        role: 'Cashier'
                                }
                        });
                }

                // MongoDB user login
                const user = await User.findOne({
                        username,
                        password
                });

                if (!user) {
                        return res.status(401).json({
                                success: false,
                                message: 'Invalid credentials'
                        });
                }

                res.json({
                        success: true,
                        user: {
                                username: user.username,
                                role: user.role
                        }
                });

        } catch (err) {
                console.error('Login error:', err);

                res.status(500).json({
                        error: err.message
                });
        }
});


// --- 2. ITEMS / INVENTORY ROUTES --- //

app.get('/api/items', async (req, res) => {
        try {
                const items = await Item.find();

                res.json(items);

        } catch (err) {
                console.error('Get items error:', err);

                res.status(500).json({
                        error: err.message
                });
        }
});


app.post('/api/items/seed', async (req, res) => {
        try {
                await Item.deleteMany({});

                const defaultItems = [
                        {
                                name: 'Bottled Water',
                                price: 250,
                                stock: 200
                        },
                        {
                                name: 'Bread',
                                price: 1000,
                                stock: 20
                        },
                        {
                                name: 'Soft Drink',
                                price: 350,
                                stock: 40
                        },
                        {
                                name: 'Instant Noodles',
                                price: 250,
                                stock: 50
                        },
                        {       name: 'milk',
                                price: 800,
                                stock: 19
                        },
                        {       name: 'spaghetti',
                                price: 1800,
                                stock: 70
                        }    
                
                ];

                await Item.insertMany(defaultItems);

                res.json({
                        message: 'Sample inventory seeded successfully!'
                });

        } catch (err) {
                console.error('Seed items route error:', err);

                res.status(500).json({
                        error: err.message
                });
        }
});


// --- 3. CHECKOUT & TRANSACTIONS ROUTES --- //

app.post('/api/transactions', async (req, res) => {
        const {
                cashierName,
                items,
                totalAmount
        } = req.body;

        try {
                const newTransaction = new Transaction({
                        cashierName,
                        items,
                        totalAmount
                });

                await newTransaction.save();

                res.status(201).json({
                        success: true,
                        transaction: newTransaction
                });

        } catch (err) {
                console.error('Transaction error:', err);

                res.status(500).json({
                        error: err.message
                });
        }
});


app.get('/api/transactions', async (req, res) => {
        try {
                const transactions = await Transaction
                        .find()
                        .sort({ timestamp: -1 });

                res.json(transactions);

        } catch (err) {
                console.error('Get transactions error:', err);

                res.status(500).json({
                        error: err.message
                });
        }
});


// --- 4. DAILY REPORTS ROUTE --- //

app.get('/api/reports/daily', async (req, res) => {
        try {
                const startOfDay = new Date();

                startOfDay.setHours(
                        0,
                        0,
                        0,
                        0
                );

                const endOfDay = new Date();

                endOfDay.setHours(
                        23,
                        59,
                        59,
                        999
                );

                const todayTransactions = await Transaction.find({
                        timestamp: {
                                $gte: startOfDay,
                                $lte: endOfDay
                        }
                });

                const totalSales = todayTransactions.reduce(
                        (acc, curr) => acc + curr.totalAmount,
                        0
                );

                res.json({
                        date: startOfDay.toDateString(),
                        totalTransactions: todayTransactions.length,
                        totalRevenue: totalSales,
                        transactions: todayTransactions
                });

        } catch (err) {
                console.error('Daily report error:', err);

                res.status(500).json({
                        error: err.message
                });
        }
});

// --- 5. CREATE ADMIN USER --- //                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

async function createAdmin() {
        try {
                const existingUser = await User.findOne({
                        username: 'CHIZITELUM'
                });

                if (!existingUser) {

                        await User.create({
                                username: 'CHIZITELUM',
                                password: 'pass123'
                        });

                        console.log('Admin user created successfully!');

                } else {

                        console.log('Admin user already exists.');

                }

        } catch (err) {
                console.error(
                        'Error creating admin user:',
                        err.message
                );

                throw err;
        }
}


// --- 6. SEED DEFAULT ITEMS --- //

async function seedItems() {
        try {

                const count = await Item.countDocuments();

                if (count === 0) {

                        await Item.insertMany([
                                {
                                        name: 'Burger',
                                        price: 2500
                                },
                                {
                                        name: 'Pizza',
                                        price: 6000
                                },
                                {
                                        name: 'Cold Soda',
                                        price: 800
                                },
                                {
                                        name: 'Fried Rice',
                                        price: 3500
                                }
                        ]);

                        console.log('Items seeded successfully!');

                } else {

                        console.log(
                                `Items already exist (${count} items). Skipping seed.`
                        );

                }

        } catch (err) {
                console.error(
                        'Error seeding items:',
                        err.message
                );

                throw err;
        }
}


// --- 7. START SERVER --- //

const frontendPath = path.join(__dirname, '../client/pos/dist');

app.use(express.static(frontendPath));

app.use((req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
    }); 
const PORT = process.env.PORT || 10000;

async function startServer() {

        try {

                console.log('Connecting to MongoDB...');

                await mongoose.connect(MONGO_URI);

                console.log(
                        'MongoDB connected successfully'
                );

                // IMPORTANT:
                // These now run ONLY after MongoDB is connected.
                await createAdmin();

                await seedItems();

                // Start Express only after database is ready
                app.listen(
                        PORT,
                        '0.0.0.0',
                        () => {
                                console.log(
                                        `Server running on port ${PORT}`
                                );
                        }
                );

        } catch (err) {

                console.error(
                        'SERVER STARTUP ERROR:',
                        err
                );

                process.exit(1);
        }
}


// Start application
startServer();