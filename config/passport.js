// config/passport.js

// load passport local strategy
var LocalStrategy = require('passport-local').Strategy;

// load the user model
var User = require('../app/models/user');

// connect passport to our app
module.exports = function(passport) {

    // =========================================================================
    // PASSPORT SESSION SETUP
    // =========================================================================

    // save the user's ID when they log in
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // find the user using their saved ID
    passport.deserializeUser(function(id, done) {
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(error => {
                done(error);
            });
    });


    // =========================================================================
    // LOCAL SIGNUP
    // =========================================================================

    passport.use('local-signup', new LocalStrategy({
        // use email instead of username
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {

        // remove spaces and make email lowercase
        email = email.trim().toLowerCase();

        // check if the email is already registered
        User.findOne({ 'local.email': email })
            .then(user => {

                // if email already exists, don't create another account
                if (user) {
                    return done(null, false,
                        req.flash('signupMessage', 'That email is already taken.'));
                }

                // create a new user
                var newUser = new User();

                // save their email and hashed password
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);

                // save the user to MongoDB
                newUser.save()
                    .then(() => {
                        return done(null, newUser);
                    })
                    .catch(error => {
                        return done(error);
                    });

            })
            .catch(error => {
                return done(error);
            });

    }));


    // =========================================================================
    // LOCAL LOGIN
    // =========================================================================

    passport.use('local-login', new LocalStrategy({
        // use email instead of username
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {

        // remove spaces and make email lowercase
        email = email.trim().toLowerCase();

        // find the user with this email
        User.findOne({ 'local.email': email })
            .then(user => {

                // if no account exists
                if (!user) {
                    return done(null, false,
                        req.flash('loginMessage', 'No user found.'));
                }

                // if the password is wrong
                if (!user.validPassword(password)) {
                    return done(null, false,
                        req.flash('loginMessage', 'Oops! Wrong password.'));
                }

                // login successful
                return done(null, user);

            })
            .catch(error => {
                return done(error);
            });

    }));

};
