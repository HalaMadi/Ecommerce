import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from './cart.controller.js'
const router = Router()

router.post('/',controller.addToCart)



export default router