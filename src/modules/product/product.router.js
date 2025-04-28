import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from './product.controller.js'
import fileUpload, { fileValidation } from "../../utils/multer.js";
const router = Router()


router.post('/', auth(['admin']), fileUpload(fileValidation.Image).fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subImages', maxCount: 4 }
]), controller.create)
router.get('/',auth(['admin']),controller.get)
router.get('/active',controller.getActive)
router.get('/:id',controller.details)
router.delete('/:id',auth(['admin']),controller.remove)
router.put('/:id',auth(['admin']),controller.update)


export default router