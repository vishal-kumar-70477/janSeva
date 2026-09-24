const mongoose = require("mongoose")

const buyerSchema = mongoose.Schema({
    fullName:{
        type:String,
        unique:true,
        required:true
    },
    mobileNo:{
        type:Number,
        required:true
    },
    address:{
        type:Object,
        required:true
    },
    role:{
        type:String,
        enum:["seller","buyer","driver"],
        default:"buyer"
    },
    isMobileVerified:{
        type:Boolean,
        default:false
    },
    verified:{
        type:String,
        default:undefined
    }
})

const buyerModel = new mongoose.model("buyers",buyerSchema);


module.exports = buyerModel;