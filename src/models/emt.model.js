const mongoose = require("mongoose");

const emtSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true,"employee id is required"],
      unique: true,
      trim: true
    },

    fullName: {
      type: String,
      required: [true,"full name is required"],
      trim: true
    },

    mobNo: {
      type: String,
      required: [true,"mobile no is required"],
      unique: true
    },

    email: {
      type: String,
      required: [true,"email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    dateOfBirth: {
      type: Date,
      required: true
    },

    qualification: {
      type: String,
      required: [true,"qualification detail is required"],
      trim: true
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0
    },

    bloodGroup: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "not known"
      ],
      default:"not known"
    },

    status: {
      type: String,
      enum: [
        "available",
        "on-duty",
        "off-duty",
        "on-leave",
        "inactive"
      ],
      default: "available"
    },

    currentAmbulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
      default: null
    },

      
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true
    }
  },{
    timestamps:true
  });



const emtModel = mongoose.model("EMT", emtSchema);

module.exports = emtModel;