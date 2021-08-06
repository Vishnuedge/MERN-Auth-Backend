const { response } = require('express');
const User = require('../models/Users');
const ErrorResponse = require('../utils/errorResponse');
const errorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

exports.register = async ( req , res , next ) => {
    const { firstName,lastName , email , password } = req.body;
    console.log(firstName)

    try {
        const user = await User.create({
            firstName ,
            lastName,
            email ,
            password 
        });
        console.log(firstName , lastName , email , password)
        sendToken( user , 201 , res );
        
    }catch (error) {
        return next( new errorResponse('Invalid Credentials', 500))
    }
};

exports.login = async ( req , res , next ) => {
    const { email , password } = req.body;
    console.log(email ,password)
    if(!email){
        return next( new errorResponse('Please provide an email', 400))
    }
    if(!password){
        return next( new errorResponse('Please provide an password', 400))
    }

    try {
        const user = await User.findOne({ email }).select("+password");
        if(!user) {
            return next( new errorResponse('Invalid User', 401))

        }

        const isMatch = await user.matchPasswords(password);

        if(!isMatch){
            return next( new errorResponse('Invalid Password', 401))

        }
        sendToken( user , 200 , res )
    } catch (error) {
        res.status(500).json({
            success : false,
            error : error.message
        });
    }
};


const sendToken = (user , statusCode , res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({ success : true , token })
}

exports.forgotpassword = async ( req , res , next ) => {
   const { email } = req.body;

   try {    
   const user = await User.findOne({ email });

   if(!user){
       return next( new ErrorResponse("Email could not be sent" , 404));
   }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const reseturl = `https://react-login-frontend-bar5i2.stackblitz.io/passwordreset/${resetToken}`;
    const message = `
        <h1>You have requested a password request</h1>
        <p>Please go to the link to reset your password</p>
        <a href=${reseturl} clicktracking=off>${reseturl}</a>
    `;
   // SEND EMAIL
        try {
        console.log('started')

            await sendEmail({
                to : user.email,
                subject :'Password reset request',
                text: message
            })
            
            res.status(200).json({success:true, data: "Email Sent"})
        }catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return next(new ErrorResponse("Email couldnt be sent" , 500))
        }
        
   } catch (error) {
       next(error)
   }
};

exports.resetpassword = async ( req , res , next ) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    try{
        const user =  await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: {$gt: Date.now()}
        })
        if(!user){
            return next( new ErrorResponse('Invalid Rest Token'),400 )
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(201).json({
            success: true,
            data:'Password Reset Success'
        })
    } catch(err){
        next(err)
    }
};

