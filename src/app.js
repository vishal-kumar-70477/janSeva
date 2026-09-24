const express = require("express")
const cookieParser = require("cookie-parser")
const buyerAuthRouter = require("./routes/buyerAuth.routes")
const path = require("path");
const app = express();
app.use(express.json());
app.use("/biharikisan/auth/buyer",buyerAuthRouter)

//viewa
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));

//public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));


app.get("/", (req,res)=>{
    res.render("dashboard/dashboard")


})


module.exports = app;
