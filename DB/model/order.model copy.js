import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema({
    UserId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    Products: [{
        productName:{
            type: String,
            required: true
        },
        productId: {
            type: Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        unitPrice: {
            type: Number,
            required: true
        },
        finalPrice: {
            type: Number,
            required: true
        }
    }],
    couponName: {
        type: Number
    },
    finalPrice: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        default: 'cash',
        enum: ['cart', 'card'],
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'cancelled', 'confirmed', 'onWay', 'delivered'],
    },
    note: string,
    reasonRejected: String,
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
})
const orderModel = mongoose.models.Order || model('Order', orderSchema);
export default orderModel