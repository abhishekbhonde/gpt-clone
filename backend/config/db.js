const mongoose = require("mongoose")


const ConnectDB = async ()=>{
    try {
        const response = await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        });
    console.log("mongodb connected");
    } catch (error) {
        console.log(error)
    }
}

module.exports = ConnectDB;