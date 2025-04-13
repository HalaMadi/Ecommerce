import { model, Mongoose, Schema } from "mongoose";

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        min: 3,
        max: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 4
    },
    image: {
        type: Object,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String,
        enum: ['Mail', 'Female']
    },
    status: {
        type: String,
        enum: ['active', 'not_active']
    },
    role: {
        type: String,
        enum: ['admin', 'user']
    },
}, {
    timestamps: true
})
const userModel = Mongoose.models.User || model('User', userSchema);
export default userModel