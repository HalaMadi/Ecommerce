import { Router } from "express";
import * as controller from './order.controller.js'
import { auth } from "../../middleware/auth.js";
const router =Router()


router.post('/',auth(['user']),controller.create)

export default router