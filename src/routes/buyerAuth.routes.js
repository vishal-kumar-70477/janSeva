const express = require("express")
const buyerAuthController = require("../controllers/buyerAuth.controller")
const buyerAuthRouter = express.Router();


buyerAuthRouter.post("/register",buyerAuthController.register)


buyerAuthRouter.post("/login",buyerAuthController.login)

module.exports = buyerAuthRouter;

