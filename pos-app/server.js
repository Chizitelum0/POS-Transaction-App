const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');
const Transaction = require('./models/Transaction');

const app = express();

app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;

// Authentication
function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

// Admin-only access
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
}

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const user = await User.findOne({
            username: username.trim()
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Get inventory
app.get('/api/items', requireAuth, async (req, res) => {
    try {
        const items = await Item.find().sort({ name: 1 });
        return res.json(items);
    } catch (err) {
        console.error('Get items error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to load inventory'
        });
    }
});

// Add product — admin only
app.post('/api/items', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, price, stock } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Product name is required'
            });
        }

        if (price === '' || price === null || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Product price is required'
            });
        }

        if (stock === '' || stock === null || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Opening stock is required'
            });
        }

        const productPrice = Number(price);
        const productStock = Number(stock);

        if (!Number.isFinite(productPrice) || productPrice < 0) {
            return res.status(400).json({
                success: false,
                message: 'Enter a valid product price'
            });
        }

        if (!Number.isInteger(productStock) || productStock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock must be a whole number of zero or more'
            });
        }

        const item = await Item.create({
            name: name.trim(),
            price: productPrice,
            stock: productStock
        });

        return res.status(201).json({
            success: true,
            message: 'Product added successfully',
            item
        });
    } catch (err) {
        console.error('Add product error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to add product'
        });
    }
});

// IMPORTANT: Do not call this route during normal use.
// It deletes the existing inventory before inserting sample products.
app.post('/api/items/seed', requireAuth, requireAdmin, async (req, res) => {
    try {
        await Item.deleteMany({});

        const defaultItems = [
            { name: 'Bottled Water', price: 250, stock: 200 },
            { name: 'Bread', price: 1000, stock: 20 },
            { name: 'Soft Drink', price: 350, stock: 40 },
            { name: 'Instant Noodles', price: 250, stock: 50 },
            { name: 'milk', price: 800, stock: 19 },
            { name: 'spaghetti', price: 1800, stock: 70 }
        ];

        await Item.insertMany(defaultItems);

        return res.json({
            success: true,
            message: 'Sample inventory seeded successfully'
        });
    } catch (err) {
        console.error('Seed items error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to seed inventory'
        });
    }
});

// Checkout and save transaction, updating stock
app.post('/api/transactions', requireAuth, async (req, res) => {
    const { cashierName, items, totalAmount } = req.body;
    const stockChanges = [];

    try {
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'A transaction must contain at least one item'
            });
        }

        const safeTotal = Number(totalAmount);

        if (!Number.isFinite(safeTotal) || safeTotal < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction total'
            });
        }

        // Validate and combine duplicate product lines.
        const quantities = new Map();
        const submittedItems = [];

        for (const line of items) {
            const name = String(line.name || '').trim();
            const quantity = Number(line.quantity);
            const price = Number(line.price);

            if (
                !name ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                !Number.isFinite(price) ||
                price < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction contains an invalid item'
                });
            }

            quantities.set(
                name,
                (quantities.get(name) || 0) + quantity
            );

            submittedItems.push({
                name,
                price,
                quantity
            });
        }

        // Check and decrement stock atomically per product.
        for (const [name, quantity] of quantities.entries()) {
            const item = await Item.findOneAndUpdate(
                {
                    name,
                    stock: { $gte: quantity }
                },
                {
                    $inc: { stock: -quantity }
                },
                {
                    new: true
                }
            );

            if (!item) {
                throw new Error(
                    `Insufficient stock for "${name}", or the product no longer exists`
                );
            }

            stockChanges.push({
                id: item._id,
                quantity
            });
        }

        const newTransaction = new Transaction({
            cashierName: cashierName || req.user.username,
            items: submittedItems,
            totalAmount: safeTotal
        });

        await newTransaction.save();

        return res.status(201).json({
            success: true,
            message: 'Transaction completed successfully',
            transaction: newTransaction
        });
    } catch (err) {
        // Restore stock if the sale could not be completed.
        for (const change of stockChanges) {
            try {
                await Item.updateOne(
                    { _id: change.id },
                    { $inc: { stock: change.quantity } }
                );
            } catch (rollbackError) {
                console.error('Stock rollback error:', rollbackError);
            }
        }

        console.error('Transaction error:', err);

        const insufficientStock =
            err.message &&
            (
                err.message.startsWith('Insufficient stock') ||
                err.message.includes('no longer exists')
            );

        return res.status(insufficientStock ? 400 : 500).json({
            success: false,
            message: insufficientStock
                ? err.message
                : 'Transaction failed. Please try again.'
        });
    }
});

// Transaction history
app.get('/api/transactions', requireAuth, async (req, res) => {
    try {
        const query = {};
        const { startDate, endDate } = req.query;

        if (startDate || endDate) {
            query.timestamp = {};

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.timestamp.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.timestamp.$lte = end;
            }
        }

        const transactions = await Transaction
            .find(query)
            .sort({ timestamp: -1 });

        return res.json(transactions);
    } catch (err) {
        console.error('Get transactions error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to load transaction history'
        });
    }
});

// Daily report
app.get('/api/reports/daily', requireAuth, requireAdmin, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const transactions = await Transaction.find({
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ timestamp: -1 });

        const totalRevenue = transactions.reduce(
            (sum, transaction) => sum + Number(transaction.totalAmount || 0),
            0
        );

        return res.json({
            date: startOfDay.toDateString(),
            totalTransactions: transactions.length,
            totalRevenue,
            transactions
        });
    } catch (err) {
        console.error('Daily report error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to load daily report'
        });
    }
});

// Create cashier — admin only
app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== 'string' ||
            !username.trim() ||
            typeof password !== 'string' ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        if (password.length < 4) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 4 characters'
            });
        }

        const existingUser = await User.findOne({
            username: username.trim()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const cashier = await User.create({
            username: username.trim(),
            password: hashedPassword,
            role: 'Cashier'
        });

        return res.status(201).json({
            success: true,
            message: 'Cashier created successfully',
            user: {
                username: cashier.username,
                role: cashier.role
            }
        });
    } catch (err) {
        console.error('Create cashier error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error creating cashier'
        });
    }
});

// Create or promote default admin
async function createAdmin() {
    const username = 'CHIZITELUM';
    const existingUser = await User.findOne({ username });

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('pass123', 10);

        await User.create({
            username,
            password: hashedPassword,
            role: 'Admin'
        });

        console.log('Admin user created successfully');
    } else if (existingUser.role !== 'Admin') {
        existingUser.role = 'Admin';
        await existingUser.save();
        console.log('CHIZITELUM promoted to Admin');
    }
}

// Seed defaults only if inventory is empty.
async function seedItems() {
    const count = await Item.countDocuments();

    if (count === 0) {
        await Item.insertMany([
            { name: 'Burger', price: 2500, stock: 0 },
            { name: 'Pizza', price: 6000, stock: 0 },
            { name: 'Cold Soda', price: 800, stock: 0 },
            { name: 'Fried Rice', price: 3500, stock: 0 }
        ]);

        console.log('Default products seeded');
    } else {
        console.log(`Inventory already has ${count} products`);
    }
}

// Serve built frontend
const frontendPath = path.join(__dirname, '../client/pos/dist');
app.use(express.static(frontendPath));

app.use((req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 10000;

async function startServer() {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI environment variable is missing');
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is missing');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');

        await createAdmin();
        await seedItems();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('SERVER STARTUP ERROR:', err);
        process.exit(1);
    }
}

startServer();
