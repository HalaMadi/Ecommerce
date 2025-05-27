import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from './cart.controller.js'
const router = Router()

router.post('/',auth(['user']),controller.addToCart)



export default router