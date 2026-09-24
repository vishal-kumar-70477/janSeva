const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    refreshTokenHash:{
        type:String,
        required:true

    },
    ip:{
        type:String,
        required:true
    },
    userAgent:{
        type:String,
        required:true
    },
    revoked:{
        type:Boolean,
        default:false
    }
})

const sessionModel = new mongoose.model("sessions",sessionSchema);

module.exports = sessionModel