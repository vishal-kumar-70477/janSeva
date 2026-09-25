const mongoose = require("mongoose");

const registrySchema = mongoose.Schema({
    patientId:{
        type:String,
        required:[true,"patient id is required"],
        ref:"Patient"
    },
    visitedHospitals:[{
        name:{
            type:String,
            trim:true
        },
        hospitalId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Hospital"
        }
    }]
});

const registryModel = new mongoose.model("Central Registry",registrySchema);

module.exports = registryModel;
