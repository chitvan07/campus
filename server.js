const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

//MIDDLEWARE
app.use(cors()); 
app.use(bodyParser.json());

//  DATABASE CONNECTION (MySQL)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'campus_db' 
});

db.connect((err) => {
    if (err) {
        console.error('❌ MySQL Connection Error:', err);
        return;
    }
    console.log('✅ MySQL Database Connected!');
});

// STATIC FOLDERS CONFIGURATION 
app.use(express.static(path.join(__dirname, 'campus login')));
app.use(express.static(path.join(__dirname, 'campus-helper')));

//CAMPUS DATA (Helper Section) 
const CLASSROOMS = [
    { code: 'C-101', building: 'Building C', floor: 1, section: 'A' },
    { code: 'C-204', building: 'Building C', floor: 2, section: 'B' },
    { code: 'L-305', building: 'Lab Block', floor: 3, section: 'C' },
    { code: 'A-102', building: 'Building A', floor: 1, section: 'D' },
    { code: 'B-201', building: 'Building B', floor: 2, section: 'E' },
];

const FOOD_TIMINGS = {
    "Breakfast": "7:00 AM - 8:00 AM",
    "Lunch": "11:00 AM - 1:30 PM",
    "Snacks": "4:45 PM - 5:45 PM",
    "Dinner": "7:30 PM - 9:00 PM"
};

const LIBRARY_STATUS = {
    overallCapacity: 65,
    floors: [
        { name: "Ground Floor", status: "Busy", seats: "25 / 80", percent: 31, type: "busy" },
        { name: "1st Floor", status: "Partial", seats: "45 / 100", percent: 45, type: "partial" },
        { name: "2nd Floor", status: "Empty", seats: "48 / 60", percent: 80, type: "empty" }
    ]
};

// HTML ROUTES 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'campus login', 'login.html'));
});

// Signup page route
app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'campus login', 'signup.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'campus-helper', 'index.html'));
});



// LOGIN API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server Error" });
        }
        if (results.length > 0) {
            res.json({ success: true, message: "Login Successful" });
        } else {
            res.status(401).json({ success: false, message: "Email or Password is wrong" });
        }
    });
});

// SIGN UP API
app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;

    const checkUser = "SELECT * FROM users WHERE email = ?";
    db.query(checkUser, [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: "Email already regestered!" });
        }

        const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        db.query(sql, [email, password], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Error saving user" });
            }
            res.json({ success: true, message: "Account successfully created!" });
        });
    });
});

// Other APIs
app.get('/api/classrooms', (req, res) => res.json(CLASSROOMS));
app.get('/api/food-timings', (req, res) => res.json(FOOD_TIMINGS));
app.get('/api/library-status', (req, res) => res.json(LIBRARY_STATUS));

// SERVER START 
app.listen(PORT, () => {
    console.log(`🚀 Master Server running at http://localhost:${PORT}`);
}); 