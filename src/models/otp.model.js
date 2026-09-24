const mongoose = require("mongoose")

const otpSchema = mongoose.Schema({
    mobileNo:{
        type:Number,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    attempts:{
        type:Number,
        default:0
    },
    expiesAt:{
        type:Date,
        required:true,
        index:{
            expires:0
        }
    }
},{
    timestamps:true
});


const otpModel = mongoose.model("otp",otpSchema);


module.exports = otpModel;