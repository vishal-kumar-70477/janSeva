const mongoose = require("mongoose");

const hospitalSchema = mongoose.Schema({
    hospitalId:{
        type:mongoose.Schema.Types.ObjectId,
        unique:true,
        required:[true,"hospital id is required"]
    },
    hospitalName:{
        type:String,
        required:[true,"hospital name is required"],
        trim:true

    },
    registrationNo:{
        type:String,
        required:[true,"registration no is required"],
        trim:true
    },
    address:{
        city:String,
        district:String,
        state:String,
        pincode:String
    },
    ownership:{
        type:String,
        required:true,
        enum:["government","private"],

    },
    contacts:{
        phone:{
            type:String,
            trim:true
        },
        email:{
            type:String,
            trim:true
        },
        websiteUrl:{
            type:String,
            trim:true
        }
    },
    emergencyServices:[{
        type:String,
        required:[true,"please select available emergency services"],
        enum:[
              "General Emergency",
              "Triage",
              "Resuscitation",
              "Trauma & Accident",
              "Cardiac Emergency",
              "Neurological Emergency",
              "Respiratory Emergency",
              "Surgical Emergency",
              "Burn Emergency",
              "Poisoning & Toxicology",
              "Snake Bite & Animal Bite",
              "Pediatric Emergency",
              "Neonatal Emergency",
              "Obstetric Emergency",
              "Gynecological Emergency",
              "Orthopedic Emergency",
              "Eye Emergency",
              "ENT Emergency",
              "Infectious Disease Emergency",
              "Psychiatric Emergency",
              "Renal & Metabolic Emergency",
              "Endocrine Emergency",
              "Hematological Emergency",
              "Critical Care",
              "Emergency Diagnostics",
              "Emergency Laboratory Services",
              "Emergency Radiology",
              "Blood Bank Emergency Services",
              "Emergency OT",
              "Ambulance & Pre-Hospital Care",
              "Inter-Hospital Transfer",
              "Disaster & Mass Casualty Management"
            ]

    }],
    departments: [{
    type: String,
    enum: [
        "Emergency Medicine",
        "General Medicine",
        "General Surgery",
        "Cardiology",
        "Cardiothoracic Surgery",
        "Neurology",
        "Neurosurgery",
        "Orthopedics",
        "Nephrology",
        "Urology",
        "Gastroenterology",
        "Hepatology",
        "Pulmonology",
        "Endocrinology",
        "Rheumatology",
        "Oncology",
        "Medical Oncology",
        "Surgical Oncology",
        "Radiation Oncology",
        "Hematology",
        "Pediatrics",
        "Neonatology",
        "Obstetrics and Gynecology",
        "Gynecology",
        "Ophthalmology",
        "ENT",
        "Dermatology",
        "Psychiatry",
        "Psychology",
        "Dentistry",
        "Plastic Surgery",
        "Burns and Plastic Surgery",
        "Vascular Surgery",
        "Pediatric Surgery",
        "Pediatric Cardiology",
        "Pediatric Neurology",
        "Infectious Disease",
        "Critical Care Medicine",
        "Anesthesiology",
        "Radiology",
        "Pathology",
        "Nuclear Medicine",
        "Emergency Radiology",
        "Physical Medicine and Rehabilitation",
        "Physiotherapy",
        "Pain Medicine",
        "Geriatric Medicine",
        "Family Medicine",
        "Preventive and Social Medicine",
        "Transfusion Medicine",
        "Laboratory Medicine",
        "Nuclear Medicine",
        "Organ Transplant",
        "Trauma Surgery",
        "Colorectal Surgery",
        "Bariatric Surgery",
        "Endocrine Surgery",
        "Thoracic Surgery",
        "Oral and Maxillofacial Surgery"
    ]
}],
ambulanceServices:{
    type:Boolean,
    default:false
},
networkStatus:{
    type:String,
    enum:["connected" ,"disconnected" ,"maintenance" ,"suspended"],
    default:"disconnected"
}

},{
    timestamps:true
});


const hospitalModel = new mongoose.model("Hospital",hospitalSchema);  