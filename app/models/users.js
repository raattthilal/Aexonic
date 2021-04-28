const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
function transform(doc, ret) {
    var id = doc._id;
    delete ret._id;
    ret.id = id;
}
var params = {
    toObject: {
        transform: transform
    },
    toJSON: {
        transform: transform
    }
};
//User Schema
const UserSchema = mongoose.Schema({
    
    firstname: String,
    
    lastname: String,
    
    phone: {
        type : String,
        unique : true
    },
    
    password: String,

    email: {
        type : String,
        unique : true
    },

    address: String,

    status : {
        type: Number,
        default: 1
      },
    
    created_at : {
        type: Date,
        default:Date.now()
      }
}, params);


const Users = module.exports = mongoose.model('Users', UserSchema);


module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.getUserByEmail = function (email, callback) {
    const query = { 
                    email: email,
                    status:1
                 }
    Users.findOne(query, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
};

module.exports.getUserById = function (id, callback) {
    Users.findById(id, callback);
};
