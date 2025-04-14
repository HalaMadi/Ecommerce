import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from '../DB/connection.js';
import authRouter from './modules/auth/auth.router.js'
const initApp = async (app, express) => {
    app.use(express.json());
    app.use(cors());
    dotenv.config()
    connectDB()
    app.get('/', (req, res) => {
        return res.status(200).json({ message: 'Welcome...' })
    })
    app.use('/auth', authRouter)


}

export default initApp