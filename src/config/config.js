const dotenv = require("dotenv")

dotenv.config()

if(!process.env.MONGO_URI){
    throw console.error("mongodb connection url is not define");
    
}
else if(!process.env.JWT_SECRET_KEY){
    throw console.error("jwt secret key is not defined")

}

const config = {
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET_KEY:process.env.JWT_SECRET_KEY
}


module.exports = config;
