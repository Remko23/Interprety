//D3
const { StatusCodes } = require('http-status-codes');
const Product = require('../models/product');

const InitController = {
    init: async (req, res) => {
        try {
            const existingProducts = await Product.getAll();

            if (existingProducts.length > 0) {
                return res.status(StatusCodes.CONFLICT).json({
                    message: 'Initialization failed. Products already exist in the database. Deletion required before re-initialization.',
                });
            }
            const productsToInitialize = req.body;
            if (!Array.isArray(productsToInitialize) || productsToInitialize.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Invalid data format. Expected a non-empty array of product objects in JSON format.',
                });
            }

            const savedProducts = [];
            for (const productData of productsToInitialize) {
                if (!productData.name || !productData.price || !productData.category_id) {
                     console.warn('Skipping product with missing required fields:', productData);
                     continue; 
                }
                const newProduct = await Product.create(productData);
                savedProducts.push(newProduct.attributes); // Bookshelf returns the model instance
            }

            if (savedProducts.length === 0) {
                 return res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'No valid products were provided for initialization.',
                });
            }

            return res.status(StatusCodes.OK).json({
                message: `Successfully initialized ${savedProducts.length} products.`,
                products: savedProducts
            });

        } catch (error) {
            console.error('Error during database initialization:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'An internal error occurred during product initialization.',
                error: error.message,
            });
        }
    },
};

module.exports = InitController;