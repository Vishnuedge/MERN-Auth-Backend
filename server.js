const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })
const express = require('express');
const connectDB = require('./config/db')
const errorHandler  =require('./middleware/error')
var cors = require('cors')
//CONNECT DB :

connectDB();

const app = express();
app.use(cors())

app.use(express.json());

app.use('/api/auth', require('./routes/auth'))
app.use('/api/private' , require('./routes/private'))


// ERROR HANDLER 

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT , ()=> console.log(`Server running in port ${PORT}`));

// HANDLE ERROR WITHOUT TRY CATCH : 

process.on('unhandledRejection' , (err, promise)=>{
    console.log(`Logged Error ${err}`);
    server.close( ()=> process.exit(1));
})