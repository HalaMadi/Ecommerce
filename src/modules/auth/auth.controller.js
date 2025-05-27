import userModel from "../../../DB/model/user.model.js";
import bcrypt from 'bcryptjs';
import { sendEmail } from '../../utils/sendEmail.js'
import jwt from 'jsonwebtoken'
import { customAlphabet } from 'nanoid'
export const register = async (req, res, next) => {
    try {
        const { userName, email, password } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' }); 
        }
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
        const newUser = await userModel.create({
            userName,
            email,
            password: hashedPassword,
        });
        const token = jwt.sign({ email }, process.env.CONFIRM_EMAIL)
        const html = `
                    <div style="font-family: Arial, sans-serif; text-align: center;">
                        <h2>Welcome to our platform ${userName} 👋</h2>
                        <p>Please confirm your email by clicking the button below:</p>
                        <a href="${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}"
                            style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                            color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                            Confirm Email
                        </a>
                        <p>If you didn’t request this, you can ignore this email.</p>
                    </div>
`;
        await sendEmail(email, 'confirm email', html)
        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const confirmEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decode = jwt.verify(token, process.env.CONFIRM_EMAIL);
        await userModel.findOneAndUpdate({ email: decode.email }, { confirmEmail: true });
        return res.status(200).json({ message: 'success' });
    } catch (error) {
        return res.status(400).json({ message: 'Invalid or expired token', error: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    if (!user.confirmEmail) {
        return res.status(400).json({ message: 'Please confirm your email' });
    }
    if (user.status == 'not_active') {
        return res.status(400).json({ message: 'Your account is blocked' });
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        return res.status(400).json({ message: 'Invalid data' });
    }
    const token = jwt.sign({ id: user.id, userName: user.userName, role: user.role }, process.env.LOGIN_SIGN)
    return res.status(200).json({ message: 'User logged in successfully', token });

}

export const sendCode = async (req, res) => {
    const { email } = req.body;
    const code = customAlphabet('123456789abcdefABCDEF', 4)();
    const user = await userModel.findOneAndUpdate({ email }, { sendCode: code });
    if (!user) {
        return res.status(400).json({ message: 'Invalid data' });
    }
    const html = `<h2>code is ${code}</h2>`;
    await sendEmail(email, `Reset Password`, html)
    return res.status(200).json({ message: 'Code sent successfully' });

}
export const resetPassword = async (req, res) => {
    const { code, email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Account not registered' });
    }
    if (user.sendCode !== code) {
        return res.status(400).json({ message: 'Invalid data' });
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
    user.password = hashedPassword;
    user.sendCode = null
    await user.save()
    return res.status(200).json({ message: 'Success' });

}