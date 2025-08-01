const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donor');
const recipientRoutes = require('./routes/recipient');
const adminRoutes = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');
require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI); // Debug print

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/recipient', recipientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);

// Serve specific HTML files
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/donor/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/donor/register.html'));
});

app.get('/recipient/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/recipient/register.html'));
});

app.get('/admin/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/dashboard.html'));
});

app.get('/donor/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/donor/dashboard.html'));
});

app.get('/recipient/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/recipient/dashboard.html'));
});

// Serve the main page for any other non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 