
const mongoose = require("mongoose");
require('dotenv').config();


const mongoURL = process.env.MONGO_URL;
console.log("Trying to connect to MongoDB:", mongoURL);

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB successfully!"))
    .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1); // Stop the server if MongoDB fails to connect
    });


// mongoose.connect(mongoURL);

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

const userStore = new MongoDBStore({
    uri: mongoURL, // Replace with your MongoDB URI
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
// app.use('/images', express.static(path.join(__dirname, 'public / images')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

console.log('Static files served from:', path.join(__dirname, 'public'));


//for user routes
const userRoute = require('./routes/userRoute');
app.use('/', userSession, userRoute);

//for admin routes
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminSession, adminRoute);

app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});
