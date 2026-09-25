const express = require("express")
const cookieParser = require("cookie-parser")
const patientAuthRouter = require("./routes/patientAuth.routes");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/janseva/patient-auth",patientAuthRouter);

//viewa
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));

//public
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req,res)=>{
    res.render("dashboard/dashboard")

})


module.exports = app;
