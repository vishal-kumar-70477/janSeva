const mongoose = require("mongoose")
const config = require("./config")
async function connectDb(){
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to db")
}

module.exports = connectDb;