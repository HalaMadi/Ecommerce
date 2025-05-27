import cartModel from "../../../DB/model/cart.model.js"

export const addToCart = async (req, res) => {
    const { productId } = req.body
    const cart = await cartModel.findOne({ userId: req.id })
    if (!cart) {
        const newCart = await cartModel.create({
            userId: req.id,
            products: [{ productId }]
        });
        return res.status(201).json({ message: 'Add to cart success', cart: newCart })
    }
    for (let i = 0; i < cart.products.length; i++) {
        if (cart.products[i].productId == productId) {
            return res.status(409).json({ message: 'Product already added to cart' })
        }
    }
    cart.products.push({ productId })
    await cart.save()
    return res.status(201).json({ message: 'Add to cart success', cart })
}