const Product = require('../models/product');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const { problem } = require('../utils/problem');


function validateData(product, isUpdate = false) {
    const price = parseFloat(product.price);
    const weight = parseFloat(product.weight);

    if (!product.name || !product.description) {
        return "Nazwa i opis produktu nie mogą być puste.";
    }

    if (isNaN(price) || isNaN(weight) || price <= 0 || weight <= 0) {
        return "Cena i waga muszą być liczbami większymi od zera.";
    }

    if (isUpdate && !product.category_id) {
        return "Trzeba podać kategorię.";
    }

    if (product.category_id && isNaN(parseInt(product.category_id))) {
        return "ID Kategorii musi być liczbą calkowitą.";
    }

    return null;
}

exports.getAll = (req, res) => {
    Product.getAll().then(
        function (allProducts) {
            res.json(allProducts);
        }
    ).catch(err => {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas pobierania produktów.');
    });
};

exports.getById = (req, res) => {
    Product.getById(req.params.id).then(
        function (product) {
            res.json(product);
        }
    ).catch(err => {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas pobierania produktu.');
    });
};

exports.store = (req, res) => {

    const productData = req.body;
    const validationError = validateData(productData);

    if (validationError) {
        return problem(res, StatusCodes.BAD_REQUEST, 'Błąd walidacji danych', validationError, '/product-validation-failed');
    }

    const newProduct = Product.create({
        'name': req.body.name,
        'description': req.body.description,
        'price': req.body.price,
        'weight': req.body.weight,
        'category_id': req.body.category_id,
    }).then(function () {
        res.json({
            'status': 'saved!',
            'product': newProduct,
        });
    }).catch(err => {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas dodawania produktu.');
    });
};

exports.updateById = (req, res) => {
    const id = req.params.id;
    const productData = req.body.product;
    if (id != productData.id) {
        return problem(res, StatusCodes.BAD_REQUEST, 'Błędne id produktu', "Id produktu w ciele żądania różni się od id produktu z URL", '/wrong-product-id');
    }

    const validationError = validateData(productData);
    if (validationError) {
        return problem(res, StatusCodes.BAD_REQUEST, 'Błąd walidacji danych', validationError, '/product-validation-failed');
    }
    Product.update(req.body.product).then(
        function (product) {
            res.json(product);
        }
    ).catch(err => {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas aktualizacji produktu.');
    });
}


// D1
const generateSeoDesc = async (productData) => {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        throw new Error('GROQ_API_KEY nie jest ustawione w zmiennych środowiskowych.');
    }

    const prompt = `
        Oto dane produktu:
        - Nazwa: ${productData.name}
        - Cena: ${productData.price} PLN
        - Opis: ${productData.description}
        - Waga: ${productData.weight}
        Przeanalizuj je oraz na ich podstawie Wygeneruj unikalny, angażujący i zoptymalizowany pod kątem SEO opis tego produktu na 50-120 słów. 
        Opis powinien zachęcać do kupna oraz zawierać słowa kluczowe związane z nazwą produktu.
        Zwróć opis w czystym formacie HTML, używając tagów <p> dla akapitów i opcjonalnie <strong> dla najważniejszych fragmentów.
        NIE ZWRACAJ ŻADNEGO INNEGO TEKSTU, TYLKO GOTOWY KOD HTML.
    `;

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'openai/gpt-oss-20b',
            messages: [{
                role: 'user',
                content: prompt
            }]
        }, {
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data.choices[0].message.content.trim();

    } catch (error) {
        console.error('Groq API Error:', error.response ? error.response.data : error.message);
        throw new Error('Niepowodzenie podczas generowania opisu SEO przez Groq API.');
    }
};

exports.getSeoDesc = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.getById(id);

        if (!product) {
            return problem(res, StatusCodes.NOT_FOUND, 'Nie znaleziono zasobu', `Produkt o ID: ${id} nie znaleziony.`, '/product-not-found');
        }

        const productData = {
            name: product.get('name'),
            price: product.get('price'),
            description: product.get('description'),
            weight: product.get('weight'),
        };

        const seoDescriptionHtml = await generateSeoDesc(productData);
        res.status(StatusCodes.OK).send(seoDescriptionHtml);

    } catch (err) {
        if (err.message.includes('not found')) {
            return problem(res, StatusCodes.NOT_FOUND, 'Nie znaleziono zasobu', err.message, '/product-not-found');
        }
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', `Błąd serwera podczas generowania opisu SEO. Szczegóły: ${err.message}`);
    }
}