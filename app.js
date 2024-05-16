const express = require('express');
const session = require('express-session');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const { check, validationResult } = require('express-validator');
const app = express();

const port = process.env.PORT || 4000;

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

mongoose.connect('mongodb://localhost:27017/learning_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
});



app.use(express.static(__dirname));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
}   
);

const User = require('./models/user');

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Validate email
    if (!validator.isEmail(email)) {
        return res.status(400).send(`${email} is not a valid email address`);
    }

    // Check if username already exists
    User.findOne({ username: username })
        .then((existingUser) => {
            if (existingUser) {
                return res.status(400).send('Username already exists');
            }

            const newUser = new User({
                username,
                email,
                password
            });

            newUser.save()
            .then(() => {
                res.send(`User registered successfully ${newUser}`);
            })
            .catch((error) => {
                res.status(400).send(`${email} - Email address already exists`);
            });
        })
        .catch((error) => {
            res.status(500).send('Error checking username availability');
        });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = User.findOne({ email })
    .then((user) => {
        if (user) {
            res.send(`${user.username} logged in successfully`);
        } else {
            res.status(400).send('Invalid credentials');
        }
    })
    .catch((error) => {
        res.status(400).send('Invalid credentials');
    });
});

app.listen(port, () => {
    console.log(`Server is currently running on port ${port}`)
});
