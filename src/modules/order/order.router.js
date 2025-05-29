import { Router } from "express";
import * as controller from './order.controller.js'
import { auth } from "../../middleware/auth.js";
const router =Router()


router.post('/',auth(['user']),controller.create)
router.get('/', auth(['user']), controller.getAll)
router.get('/:status', auth(['admin']), controller.getByStatus)
router.patch('/:id', auth(['admin']), controller.updateStatus)

export default router