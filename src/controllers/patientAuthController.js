const patientModel = require("../models/patient.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const counterModel = require("../models/counter.model");
const registaryModel = require("../models/centralRegistry.model");
const registryModel = require("../models/centralRegistry.model");

//login

async function login(req, res){
    const {email, mobile, password} = req.body;

     const user = await patientModel.findOne({
        $or: [{email}, {mobNo: mobile || email}]
     });
     if(!user){
        return res.status(401).json({
            message:"User and Password not found"
        })
    }
    

    const isPasswordValid= await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Password is inncoreect"
        })
    }
     const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET_KEY,{
        expiresIn:"7d"
    })
    const accessToken = jwt.sign({
        id: user._id,
        role: user.role
    }, config.JWT_SECRET_KEY,{
        expiresIn:"15min"
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    });

    return res.json({
        success:true,
        message:"Login successful",
        accessToken,
        user:{id:user._id, fullName:user.fullName, role:user.role}
    });

}

async function renderPatientDashboard(req, res){
    const {refreshToken} = req.cookies;

    if(!refreshToken){
        return res.redirect("/");
    }

    try{
        const payload = jwt.verify(refreshToken, config.JWT_SECRET_KEY);
        const patient = await patientModel.findById(payload.id).lean();

        if(!patient || patient.role !== "patient"){
            return res.redirect("/");
        }

        const birthDate = new Date(patient.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear() -
            ((today.getMonth() < birthDate.getMonth() ||
              (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) ? 1 : 0);
        const profileFields = [
            patient.fullName,
            patient.dateOfBirth,
            patient.mobNo,
            patient.email,
            patient.address?.city,
            patient.address?.state,
            patient.emergencyContact?.fullName,
            patient.emergencyContact?.mobNo,
            patient.bloodGroup,
            patient.medicalHistory,
            patient.medications
        ];
        const profileCompletion = Math.round(profileFields.filter(Boolean).length / profileFields.length * 100);

        return res.render("patient/patientDash", {patient, age, profileCompletion});
    }catch(error){
        res.clearCookie("refreshToken");
        return res.redirect("/");
    }
}

// register patient
async function registerPatient(req,res){
    const {fullName,gender,dateOfBirth,mobNo,email,password,address,emergencyContact,bloodGroup,allergies,medicalHistory,medications,additionalInfo} = req.body;

    if(!fullName || !gender || !dateOfBirth || !mobNo || !email || !password || !address || !emergencyContact){
        return res.status(400).json({
            success:false,
            message:"Please fill mandatory fields"
        });
    }

    const isPatientExist = await patientModel.findOne({$or:[{email},{mobNo}]});

    if(isPatientExist){
        return res.status(409).json({
            success:false,
            message:"Patient already exist"
        })
    }

    const hashPassword = await bcrypt.hash(password, 12);
    
    const patient = await patientModel.create({
        fullName,
        gender,
        dateOfBirth,
        mobNo,
        email,
        password:hashPassword,
        address,
        emergencyContact,
        bloodGroup,
        allergies,
        medicalHistory,
        medications,
        additionalInfo
    });

    // access token 
    const accessToken = jwt.sign({
        id:patient._id,
        role:patient.role
    },config.JWT_SECRET_KEY,{
        expiresIn:"15m"
    });

    // refresh token
    const refreshToken = jwt.sign({
        id:patient._id,
        role:patient.role
    },config.JWT_SECRET_KEY,{
        expiresIn:"7d"
    });

    const counter = await counterModel.findOneAndUpdate({_id:"patient"},
        {$inc:{sequence:1}},{
            new:true,
            upsert:true
        }
    );
    const patientId = `PAT${new Date().getFullYear()}${String(counter.sequence).padStart(6,"0")}`;

    patient.patientId = patientId;
    await patient.save();

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:true,
        maxAge:7*24*60*60*1000
    });

    await registryModel.create({
        patientId:patient.patientId
    });
    
    return res.status(201).json({
        success:true,
        message:"Patient registered successfully",
        PatiendID:patientId,
        accessToken
    });




}
// otp verification 

async function otpVerification(req,res){
    const mobileNo = req.mobileNo;
    const user = await buyerModel.findOne({
        mobileNo
    })
    const generateOtp = ()=>{
        return Math.floor(100000 + Math.random() * 900000)
    }
    const otp = String(generateOtp());
    const otpDoc = await otpModel.create({
        mobileNo,
        otp,
    })

}









module.exports = {registerPatient, login, renderPatientDashboard};