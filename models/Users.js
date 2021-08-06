const crypto  = require('crypto')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require ('jsonwebtoken')
const UserSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : [true , "Please Provide a FirstName"]
    },
    lastName : {
        type : String,
        required : [true , "Please Provide a LastName"]
    },
    email : {
        type : String,
        required : [true , "Please Provide a email"],
        unique : true,
        match : [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ , 
            "Please Provide a valid email"
        ]
    },
    password : {
        type : String,
        required : [true , "Please add a password"],
        minlength : 6,
        select : false,
    },
    resetPasswordToken : String,
    resetPasswordExpires : Date
    
});

UserSchema.pre('save' , async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash( this.password , salt );
    next();
})

UserSchema.methods.matchPasswords = async function(password) {
    return await bcrypt.compare(password , this.password)
}

UserSchema.methods.getSignedToken = function(){
    return jwt.sign( { id : this._id } , process.env.jwt_SECRET , {expiresIn : process.env.JWT_EXPIRE} )
}

// UserSchema.methods.createPasswordResetToken = function(){
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     this.passwordResetToken =  crypto.createHash('sha256').update(resetToken).digest('hex'); 
//     console.log({resetToken} , this.passwordResetToken)
//     this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
   
//     return resetToken;
// }

UserSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken =  crypto.createHash('sha256').update(resetToken).digest('hex'); 
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;    
}

const User = mongoose.model('User' , UserSchema );
module.exports = User;