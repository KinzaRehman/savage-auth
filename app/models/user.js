
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// create the user schema
var userSchema = mongoose.Schema({
    local: {
        email: String,
        password: String
    }
});

// hash the password before saving it
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, 8);
};

// check the password when logging in
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the user model
module.exports = mongoose.model('User', userSchema);
