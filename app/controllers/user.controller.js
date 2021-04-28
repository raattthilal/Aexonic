const User = require('../models/users');
const jwt = require('jsonwebtoken');
const config = require('../../config/params.config');

module.exports = {
    //Create new User
    createUser: (req, res, next) => {

        const newUser = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: isNaN(req.body.phone) ? req.body.phone : req.body.phone.toString(),
            password: req.body.password,
            address: req.body.address
        })
        User.addUser(newUser, (err, data) => {
            if (err) {
                var message = " Failed to register new user "
                if(err.keyValue.email){
                    message = "Email already existing. Failed to register new user"
                }
                if(err.keyValue.phone){
                    message=" Phone already existing. Failed to register new user"
                }
                return res.send({
                    success: false,
                    error: err,
                    message: message
                });
            } else {
                return res.send({
                    success: true,
                    id: data.id,
                    message: 'New User registered successfully'
                });
            }
        })
    },
    //Authenticate - User login
    authenticate: (req, res, next) => {
        const email = req.body.email;
        const password = req.body.password;

        if(!email || !password){
            if(!email){
                res.send({
                    success: false,
                    message: 'Email is Empty..!'
                })
            }
            if(!password){
                res.send({
                    success: false,
                    message: 'Password is Empty..!'
                })
            }
            if(!email && !password){
                res.send({
                    success: false,
                    message: 'Email and password is Required..!'
                })
            }
        }
        //Getting user details
        User.getUserByEmail(email, (err, userData) => {
            if (err) throw err;
            if (!userData) {
                return res.send({
                    success: false,
                    message: 'User not existed'
                })
            }
            //Cross checking password
            User.comparePassword(password, userData.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                //Creating jwt token
                    const token = jwt.sign(userData.toJSON(), config.development.jwt.secret, {
                        expiresIn: '24h' //24 hours
                    });
                   return res.send({
                        success: true,
                        token: token,
                        user: userData,
                        expiresIn: '24 Hours'
                    });
                } else {
                    return res.send({
                        success: false,
                        message: 'Wrong Password'
                    });
                }
            })
        })
    },

    //Search in Users
    searchUser: async (req, res, next) => {
        let keyword = req.query.keyword;
        if(!keyword){
           return res.send({
            success: false,
            message: "search Keyword required.!",
           })
        }
        
        let findObj={
             $or: [
                    {
                        firstname:{ $regex : keyword }
                    },
                    {
                        lastname:{ $regex : keyword }
                    },
                    {
                        email:{ $regex : keyword }
                    },
                    {
                        address:{ $regex : keyword }
                    },
                    {
                        phone:{ $regex : keyword }
                    }
            ]
        }
        
        
        let fields ={ 
            firstname: 1,
            lastname:1,
            phone:1,
            email:1,
            address:1,
            created_at:1,
            status: 1 
        }
        const page = Number(req.query.page) || 0;
        const limit = Number(req.query.limit) || 5;
        var skipPage = page * limit;

        await User.find(findObj,fields).skip(skipPage).limit(limit).exec(async (err, data) => {

            if (err || data.length == 0) {
                return res.send({
                    success: false,
                    message: "No Users founded..!",
                    error: err ? err : "No Users data in db"
                })
            }
            
            const count = await User.countDocuments(findObj); 
            let result = {
                data: { 
                        data:data,
                        page:page,
                        count:count
                    },
                success: true
            }
            res.send(result);
        })
    },
    // Get All Users
    listUser: async (req, res, next) => {
        
        let findObj={
            status: 1 
        }

        let fields ={ 
            firstname: 1,
            lastname:1,
            phone:1,
            email:1,
            address:1,
            created_at:1,
            status: 1 
        }
        const page = Number(req.query.page) || 0;
        const limit = Number(req.query.limit) || 5;
        var skipPage = page * limit;

        await User.find(findObj,fields).skip(skipPage).limit(limit).exec(async (err, data) => {

            if (err || data.length == 0) {
                return res.send({
                    success: false,
                    message: "No Users founded..!",
                    error: err ? err : "No Users data in db"
                })
            }
            
            const count = await User.countDocuments(findObj); 
            let result = {
                data: { 
                        data:data,
                        page:page,
                        count:count
                    },
                success: true
            }
            res.send(result);
        })
    },

    //Update User
    updateUser: async (req, res, next) => {
        let id = req.params.id;
        let params = req.body;
        if (!params.firstname && !params.lastname && !params.phone && !params.email &&!params.address) {
            return res.send({
                success: false,
                message: "Nothing to update"
            })
        }
        let update = {}
        if (params.firstname) {
            update.firstname = params.firstname;
        }
        if (params.lastname) {
            update.lastname = params.lastname;
        }
        if (params.phone) {
            update.phone = params.phone;
        }
        if (params.email) {
            update.email = params.email;
        }
        if (params.address) {
            update.address = params.address;
        }
    
        await User.find({ "_id": id, "status": "1" },async (err, data) => {
            if (err || data.length == 0) {
                return res.send({
                    success: false,
                    message: "User Not founded with this userId"
                })
            }
            //if User Existing
            await User.findByIdAndUpdate(id,
                {
                    $set: update
                }, { new: true },
                (err, data) => {
                    if (err || !data) {
                        return res.send({
                            success: false,
                            message: "User Updation failed..!"
                        })
                    }
                    return res.send({
                        success: true,
                        message: "User Updated successfully"
                    })
                });
        })
    },
   

}