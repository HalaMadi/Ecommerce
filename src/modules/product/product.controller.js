import slugify from "slugify"
import productModel from "../../../DB/model/product.model.js"
import categoryModel from "../../../DB/model/category.model.js"
import cloudinary from "../../utils/cloudinary.js"

export const create = async (req, res) => {
    const { name, categoryId, discount, price } = req.body
    const checkCategory = await categoryModel.findById(categoryId);
    if (!checkCategory) {
        return res.status(404).json({ message: 'Category Not found' })
    }
    req.body.slug = slugify(name)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path,
        { folder: `${process.env.APP_NAME}/products/${name}` }
    )
    req.body.subImages = []
    if (req.files.subImages) {
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path,
                { folder: `${process.env.APP_NAME}/products/${name}/subImages` }
            )
            req.body.subImages.push({ secure_url, public_id })
        }
    }

    req.body.mainImage = { secure_url, public_id }
    req.body.createBy = req.id
    req.body.updatedBy = req.id
    req.body.finalPrice = price - (price * (discount || 0) / 100);
    const product = await productModel.create(req.body)
    return res.status(201).json({ message: 'Product Created Successfully', product })
}

export const get = async (req, res) => {
    const product = await productModel.find({}).select('name mainImage price')
    return res.status(200).json({ message: 'Success', product })
}
export const getActive = async (req, res) => {
    const product = await productModel.find({ status: 'active' })
    return res.status(200).json({ message: 'Success', product })
}

export const details = async (req, res) => {
    const { id } = req.params
    const product = await productModel.findById(id);
    if (!product) {
        return res.status(404).json({ message: 'Not found' })
    }
    return res.status(200).json({ message: 'Success', product })

}


export const remove = async (req, res) => {
    const { id } = req.params
    const product = await productModel.findByIdAndDelete(id);
    if (!product) {
        return res.status(404).json({ message: 'Not found' })
    }
    await cloudinary.uploader.destroy(product.mainImage.public_id)
    return res.status(200).json({ message: 'Success', product })
}
export const update = async (req, res) => {
    const { id } = req.params
    const { name } = req.body;
    const userId = req.id;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    const product = await productModel.findById(id);
    if (!product) {
        return res.status(404).json({ message: 'Product Not found' })
    }
    product.name = name
    product.slug = slugify(name)
    product.updatedBy = userId;
    await product.save();
    return res.status(200).json({ message: 'Product updated Successfully' })
}