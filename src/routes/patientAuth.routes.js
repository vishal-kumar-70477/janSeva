const express = require("express");
const patientAuthRouter = express.Router();

// require controller functions
const patientAuthController = require("../controllers/patientAuthController");


// routes
patientAuthRouter.get("/login",patientAuthController.renderPatientDashboard);

patientAuthRouter.post("/register-patient",patientAuthController.registerPatient);

patientAuthRouter.post("/login",patientAuthController.login);





module.exports = patientAuthRouter;






