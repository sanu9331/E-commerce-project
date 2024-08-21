require('dotenv').config(); // Load environment variables at the start

const mongoose = require("mongoose");
// Changed MongoDB connection to use environment variable
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

const express = require("express");
const app = express();

const port = process.env.PORT || 3000;
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const nocache = require("nocache");

//app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Admin session configuration
const adminSession = session({
    secret: "admin-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 }
});

// Updated MongoDBStore to use environment variable
const userStore = new MongoDBStore({
    uri: process.env.MONGODB_URI, // Changed to use environment variable
    collection: "user_sessions",
});

// User session configuration
const userSession = session({
    secret: "user-secret",
    resave: false,
    saveUninitialized: true,
    store: userStore,
    cookie: { maxAge: 6000000 }
});

app.use(nocache());

const flash = require('express-flash')
app.use(flash());

// Serve static files from the 'public' directory
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// For user routes
const userRoute = require('./routes/userRoute');
app.use('/', userSession, userRoute);

// For admin routes
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminSession, adminRoute);

app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});
