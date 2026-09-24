const buyerModle = require("../models/buyer.model")
const sessionModel = require("../models/session.model")
const otpModel = require("../models/otp.model")
const jwt = require("jsonwebtoken")
const config = require("../config/config")
const argon2 = require("argon2")
const crypto = require("crypto")
const buyerModel = require("../models/buyer.model")

//login

async function login(req, res){
    const{email, password} = req.body

     const user = await buyerModle.findOne({email})
     if(!user){
        return res.status(401).json({
            message:"User and Password not found"
        })
    }
    const hashPassword = crypto.createHash("she256").update(password).digest("hex")
    
    const isPasswordValid= user.password === hashPassword

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Password is inncoreect"
        })
    }
     const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,{
        expiresIn:"7d"
    })

    const refreshTokenHash= crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })
   
      const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,{
        expiresIn:"15min"
    })


}


// register
async function register(req,res){
    const {fullName,mobileNo,address,role} = req.body;

    if(!fullName || !mobileNo || !address){
        return res.status(400).json({
            success:false,
            message:"All fields are required"

        });
    }

    const isBuyerExist = await buyerModle.findOne({
        $or:[{fullName},{mobileNo}]
    })

    if(isBuyerExist){
        return res.status(409).json({
            success:false,
            message:"User already exist"
        })
    }
    

    const buyer = await buyerModel.create({
        fullName,
        mobileNo,
        address,
        role,
        verified:(role == "seller" || role == "driver")?"pending":undefined,

    });

   
  

    // refresh token
    const refreshToken = jwt.sign({
        userId:buyer._id,
        userRole:buyer.role
    },config.JWT_SECRET_KEY,{
        expiresIn:"7d"
    })

    const refreshTokenHash = await crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        userId:buyer._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"]
    });

    // access token

    const accessToken = await jwt.sign({
        userId:buyer._id,
        userRole:buyer.role
    },config.JWT_SECRET_KEY,{
        expiresIn:"15m"
    });

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    });

    res.status(200).json({
        success:true,
        message:"User Registered Successfully",
        username,
        role,
        accessToken
    })





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









module.exports = {register, login};