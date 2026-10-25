
require('dotenv').config()

const express = require('express')
const path = require('path')
const { MongoClient } = require('mongodb')

const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')

const app = express()
const PORT = process.env.PORT || 4000

// passport login/signup setup
require('./config/passport')(passport)


// middleware
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))


// keep users logged in
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: 'pinboard'
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


// MongoDB
const client = new MongoClient(process.env.MONGODB_URI)
let db


// landing page - login or signup
app.get('/', (req, res) => {
  res.render('index')
})


// LOGIN

// show login page
app.get('/login', (req, res) => {
  res.render('login', {
    message: req.flash('loginMessage')
  })
})

// check login information
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}))


// SIGNUP

// show signup page
app.get('/signup', (req, res) => {
  res.render('signup', {
    message: req.flash('signupMessage')
  })
})

// create new account
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}))


//is user loggedin? 
// check if the user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

// PROFILE

// only logged in users can see their pinboard
// show the logged-in user's pins
app.get('/profile', isLoggedIn, function(req, res) {
    db.collection('pins')
        .find({ userId: req.user._id })
        .toArray()
        .then(pins => {
            res.render('profile.ejs', {
                user: req.user,
                pins: pins
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Error loading pins');
        });
});




// LOGOUT
app.post('/logout', (req, res, next) => {
  req.logout(error => {
    if (error) return next(error)

    req.session.destroy(error => {
      if (error) return next(error)

      res.clearCookie('connect.sid')
      res.redirect('/')
    })
  })
})


// CRUD FOR PINS

// CREATE - add a new pin
app.post('/pins', (req, res) => {

  // user must be logged in to save pins
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }

  console.log(req.body)

  const { imageUrl, category, itemName, color, tags } = req.body

  // check required fields
  if (!imageUrl || !category || !itemName || !color) {
    return res.status(400).send('Please fill out all required fields.')
  }

  // check image URL
  let url

  try {
    url = new URL(imageUrl)

    if (!['http:', 'https:'].includes(url.protocol)) {
      return res.status(400).send('Invalid image URL')
    }
  } catch (error) {
    return res.status(400).send('Invalid image URL')
  }

  // separate tags by commas
  const tagArray = tags ? tags.split(',') : []

  // pin information saved in MongoDB
  const newPin = {
    userId: req.user._id,
    imageUrl: url.href,
    category,
    itemName,
    color,
    tags: tagArray,
    createdAt: new Date()
  }

  db.collection('pins').insertOne(newPin)
    .then(result => {
      console.log('Pin saved', result.insertedId)
      res.redirect('/profile')
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('Error saving pin')
    })
})


// connect to MongoDB and start server
client.connect()
  .then(() => {
    console.log('Connected to MongoDB Atlas!')

    db = client.db('pinboard')

    // mongoose is used for user accounts
    return mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'pinboard'
    })
  })
  .then(() => {
    console.log('Mongoose connected!')

    // port 4000 (or the port in .env)
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  })
  .catch(error => {
    console.error('Database connection failed:', error)
  })
