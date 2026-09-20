const mongoose =  require ('mongoose');

const ConnectDB = () => {
    try{
    mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected ✅')
    }catch(error){
        console.error('MongoDB connection failed ❌');
        console.error(error.message);

        process.exit(1);
    }
}

module.exports = ConnectDB;