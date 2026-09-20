require('dotenv').config();
const app = require('./src/app')
const ConnectDB = require('./src/db/db')

ConnectDB();

app.listen(process.env.PORT_NO , ()=>{
   console.log(`Server is running on the port ${process.env.PORT_NO }`);
})