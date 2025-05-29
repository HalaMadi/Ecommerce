import cartModel from "../../../DB/model/cart.model.js"
import couponModel from "../../../DB/model/coupon.model.js";
import orderModel from "../../../DB/model/order.model.js";
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

export const getAll = async (req, res) => {
    const orders = await orderModel.find({ UserId: req.id }).populate('Products.productId', 'name finalPrice').populate('UserId', 'name email');
    if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found' });
    }
    return res.status(200).json({ message: 'Orders retrieved successfully', orders });
}

export const getByStatus = async (req, res) => {
    const { status } = req.params;
    const orders = await orderModel.find({ status: status }).populate('Products.productId', 'name finalPrice');
    if (!orders || orders.length === 0) {
        return res.status(404).json({ message: `No orders found with status ${status}` });
    }
    return res.status(200).json({ message: `Orders with status ${status} retrieved successfully`, orders });
}

export const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }
    const order = await orderModel.findById(id);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }
    if (status == 'delivered') {
        return res.status(400).json({ message: 'can\'t cancel delivered orders' });
    }
    order.status = req.body.status;
    order.updatedBy = req.id;
    await order.save();
    if (status === 'cancelled') {
        for (const product of order.Products) {
            await productModel.updateOne(
                { _id: product.productId },
                { $inc: { stock: product.quantity } }
            );
        }
    }
    if (req.body.coupon) {
        await couponModel.updateOne(
            { name: req.body.coupon.name },
            { $pull: { usedBy: req.id } }
        );
    }
    return res.status(200).json({ message: 'Order status updated successfully', order });
}