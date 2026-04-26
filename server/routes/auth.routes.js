import express from "express"
import { googelAuth, logOut } from "../controllers/auth.controller.js"
const authRouter=express.Router()
 
authRouter.post("/googel", googelAuth)
authRouter.post("/logout", logOut)



export default authRouter


//http:localhost:8000/api/auth/logout
