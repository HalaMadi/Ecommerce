import couponModel from "../../../DB/model/coupon.model.js"

export const create = async (req, res) => {
    if (await couponModel.findOne({ name: req.body.name })) {
        return res.status(409).json({ message: 'Coupon already exist' })
    }
    req.body.expireDate = new Date()
    req.body.createdBy = req.id
    req.body.updatedBy = req.id
    const coupon = await couponModel.create(req.body)
    return res.status(201).json({ message: 'Success', coupon })
}

export const get = async (req, res) => {
    const coupons = await couponModel.find({})
    return res.status(200).json({ message: 'Success', coupons })
}

export const remove = async (req, res) => {
    const { id } = req.params
    const coupon = await couponModel.findByIdAndDelete(id)
    if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' })
    }
    return res.status(200).json({ message: 'Coupon deleted successfully', coupon })
}
export const update = async (req, res) => {
    const { id } = req.params
    const { name, amount } = req.body
    const userId = req.id
    if (!name || !amount) {
        return res.status(400).json({ message: 'Missed Required Data' })
    }
    const coupon = await couponModel.findByIdAndUpdate(id, {
        name, amount, updatedBy: userId
    },{new:true})
    if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' })
    }
    return res.status(200).json({ message: 'Coupon updated successfully', coupon })
}
