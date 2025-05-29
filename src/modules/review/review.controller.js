import orderModel from "../../../DB/model/order.model copy.js";
import productModel from "../../../DB/model/product.model.js";
import reviewModel from "../../../DB/model/reviews.mode.js";

export const createReview = async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.id;
    const product = await productModel.findById(productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const order = await orderModel.findOne({ userId, 'Products.productId': productId, status: 'delivered' });
    if (!order) {
        return res.status(400).json({ message: 'can\'t review this product' });
    }
    if (order.status !== 'delivered') {
        return res.status(400).json({ message: 'You can only review completed orders' });
    }
    const review = await reviewModel.create({
        createdBy: userId,
        productId,
        rating,
        comment
    })
    if (!review) {
        return res.status(400).json({ message: 'Failed to create review' });
    }
    return res.status(201).json({ message: 'Review created successfully', review });
}

export const getReviews = async (req, res) => {
    const { tripId } = req.params;
    const reviews = await reviewModel.find({ trip: tripId }).populate('createdBy', 'name email');
    if (!reviews) {
        return res.status(400).json({ message: 'No reviews found' });
    }
    return res.status(200).json({ message: 'Reviews retrieved successfully', reviews });
}