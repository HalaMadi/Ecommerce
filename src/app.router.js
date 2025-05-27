import cors from 'cors'
import connectDB from '../DB/connection.js';
import authRouter from './modules/auth/auth.router.js'
import categoryRouter from './modules/category/category.router.js'
import productRouter from './modules/product/product.router.js'
import couponRouter from './modules/coupon/coupon.router.js'
import cartRouter from './modules/cart/cart.router.js'
import orderRouter from './modules/order/order.router.js'
const initApp = async (app, express) => {
    app.use(express.json());
    app.use(cors());
    await connectDB()
    app.get('/', (req, res) => {
        return res.status(200).json({ message: 'Welcome...' })
    })
    app.use('/auth', authRouter)
    app.use('/categories', categoryRouter)
    app.use('/products',productRouter)
    app.use('/coupons',couponRouter)
    app.use('/carts',cartRouter)
    app.use('/orders',orderRouter)


}

export default initApp