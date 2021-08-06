const  nodemailer = require('nodemailer')
const nodemailMailGun = require('nodemailer-mailgun-transport')
const { google } = require('googleapis');

const CLIENT_ID = '800999738960-q92f9u846cu66qvhtem4mck29o9075qr.apps.googleusercontent.com';
const CLIENT_SECRET = 'AbLkUnfIkctHx6rwUyWD0Qew';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04R3ZP-nO67FQCgYIARAAGAQSNwF-L9Irb7cZB4wLesLsGQHWoDpswxJ-Prj2xT0blFxqujQzVZdg-VqsnMcsaowyIs68W6nJQDY';

const oAuth2client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2client.setCredentials({ refresh_token: REFRESH_TOKEN });


const sendEmail = async (options) =>{
    const accessToken = await oAuth2client.getAccessToken();
    console.log(accessToken.token)
    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth:{
            type: 'OAuth2',
            user : process.env.EMAIL_FROM,
            clientId : CLIENT_ID,
            clientSecret : CLIENT_SECRET,
            refreshtoken : REFRESH_TOKEN,
            accessToken : accessToken.token
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
    })

    const mailOptions = {
        from : process.env.EMAIL_FROM,
        to: options.to,
        subject: options.to,
        html : options.text,
       

    }
    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            console.log(err)
        }else{
            console.log("error not occured")
            console.log(info)
        }
    })
}

module.exports = sendEmail;