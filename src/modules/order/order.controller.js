import cartModel from "../../../DB/model/cart.model.js"
import couponModel from "../../../DB/model/coupon.model.js";
import orderModel from "../../../DB/model/order.model copy.js";
import productModel from "../../../DB/model/product.model.js";

export const create = async (req, res) => {
    const { couponName } = req.body
    const cart = await cartModel.findOne({ userId: req.id });
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' })
    }
    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName })
        if (!coupon) {
            return res.status(404).json({ message: 'coupon not found' })
        }
        if (coupon.expiredDate <= new Date()) {
            return res.status(404).json({ message: 'this coupon has expired' })
        }
        if (coupon.usedBy.includes(req.id)) {
            return res.status(400).json({ message: 'coupon already used' })
        }
        req.body.coupon = coupon;
    }
    let finalProducts = [];
    let subTotal = 0;
    for (let product of cart.products) {
        const checkProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity }
        })
        if (!checkProduct) {
            return res.status(404).json({ message: `Product with id ${product.productId} not found or out of stock` })
        }
        product = product.toObject();
        product.productName = checkProduct.name;
        product.unitPrice = checkProduct.finalPrice;
        product.finalPrice = checkProduct.finalPrice * product.quantity;
        subTotal += product.finalPrice;
        finalProducts.push(product);
    }
    if (!req.body.address || !req.body.phoneNumber) {
        return res.status(400).json({ message: 'Address and phone number are required' });
    }
    const order = await orderModel.create({
        UserId: req.id,
        Products: finalProducts,
        finalPrice: subTotal - (subTotal * (req.body.coupon.amount || 0) / 100),
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        couponName: couponName ?? '',
    });
    for (const product of cart.products) {
        await productModel.updateOne(
            { _id: product.productId },
            { $inc: { stock: -product.quantity } }
        )
    }
    // If a coupon was used, update the coupon's usedBy field
    if (req.body.coupon) {
        await couponModel.updateOne(
            { _id: req.body.coupon._id },
            { $addToSet: { usedBy: req.id } }
        );
    }
    // Clear the cart after order creation
    await cartModel.updateOne(
        { userId: req.id },
        { $set: { products: [] } }
    );
    await cartModel.findOneAndDelete({ userId: req.id });
    return res.status(201).json({ message: 'Order created successfully', order });
}