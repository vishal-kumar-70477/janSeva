const mongoose = require("mongoose");


const patientSchema = new mongoose.Schema({
    patientId:{
        type:String,
        unique:true,
        trim:true 
    },
    fullName:{
        type:String,
        required:[true,"full name is required"],
        trim:true
    },
    gender:{
        type:String,
        required:[true,"gender is required"],
        enum:["Male","Female","Other","Prefer not to say"]
    },
    dateOfBirth:{
        type:Date,
        required:[true,"dob is required"]
    },
    mobNo:{
        type:String,
        required:[true,"mobile no is required"],
        trim:true
    },
    email:{
        type:String,
        match:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        required:[true,"email is required"],
        unique:true,
        lowecase:true,
        trim:true

    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    address:{
       city:String,
       district:String,
       state:String,
       pincode:String
    },
    emergencyContact:{
        fullName:{
            type:String,
            trim:true
        },
        mobNo:{
            type:String,
            trim:true
        },
        relationship:{
            type:String,
            trim:true
        }
    },
    profilePhotoUrl:{
        type:String
    },
    bloodGroup:{
        type:String,
        enum:["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "None", "Not known"],
        default:"Not known"
    },
    allergies:{
        type:String,
        default:"Not known"
    },
    medicalHistory:{
        type:String,
        default:"Not added"
    },
    medications:{
        type:String,
        default:"Not added"
    },
    additionalInfo:{
        type:String,
        default:"Not added"
    },
    role:{
        type:String,
        default:"patient"
    }
},{
    timestamps:true
});

const patientModel = new mongoose.model("Patient",patientSchema);

module.exports = patientModel;
