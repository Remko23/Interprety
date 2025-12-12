const { StatusCodes } = require('http-status-codes');
const Product = require('../models/product');
const { problem } = require('../utils/problem');

const InitController = {
    init: async (req, res) => {
        try {
            const existingProducts = await Product.getAll();

            if (existingProducts.length > 0) {
                return problem(res, StatusCodes.CONFLICT, 'Conflict', 'Błąd inicjalizacji: Produkty już są w bazie danych', '/init-conflict');
            }
            const productsToInitialize = req.body;
            if (!Array.isArray(productsToInitialize) || productsToInitialize.length === 0) {
                return problem(res, StatusCodes.BAD_REQUEST, 'Nieprawidłowy format danych', 'Oczekiwano listy produktów w formacie JSON.', '/invalid-data-format');
            }

            const savedProducts = [];
            for (const productData of productsToInitialize) {
                if (!productData.name || !productData.price || !productData.category_id) {
                     console.warn('Skipping product with missing required fields:', productData);
                     continue; 
                }
                const newProduct = await Product.create(productData);
                savedProducts.push(newProduct.attributes);
            }

            if (savedProducts.length === 0) {
                return problem(res, StatusCodes.BAD_REQUEST, 'Brak poprawnych produktów', 'Nie podano żadnych poprawnych produktów do inicjalizacji.', '/no-valid-products');
            }

            return res.status(StatusCodes.OK).json({
                message: `Successfully initialized ${savedProducts.length} products.`,
                products: savedProducts
            });

        } catch (error) {
            console.error('Error during database initialization:', error);
            return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd wewnętrzny serwera', `Wystąpił błąd wewnętrzny podczas inicjalizacji produktów. Szczegóły: ${error.message}`);
        }
    },
};

module.exports = InitController;