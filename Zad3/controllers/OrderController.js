const Order = require('../models/order');
const Product = require('../models/product');
const ProductModel = Product.Model;
const OrderItem = require('../models/orderItem');
const knex = require('knex')(require('../config/knexfile'));
const { StatusCodes } = require('http-status-codes');
const { problem } = require('../utils/problem');
const Opinion = require('../models/opinion');

const STATUS = {
    UNCONFIRMED: 1,
    CONFIRMED: 2,
    CANCELED: 3,
    COMPLETED: 4,
};

async function validateOrderData(orderData) {
    
    if (!orderData.user_name || !orderData.email || !orderData.phone_number) {
        return "Nazwa użytkownika, email i numer telefonu są obowiązkowe.";
    }

    if (!/^\S+@\S+\.\S+$/.test(orderData.email)) {
        return "Nieprawidłowy format adresu email.";
    }

    if (!/^\+?[\d\s-]+$/.test(orderData.phone_number) || orderData.phone_number.replace(/\D/g, '').length < 9) {
        return "Nieprawidłowy numer telefonu. Powinien zawierać cyfry.";
    }

    if (!orderData.items || orderData.items.length === 0) {
        return "Zamówienie musi zawierać co najmniej jeden produkt.";
    }

    const productIds = orderData.items.map(item => item.product_id);
    if (productIds.some(id => isNaN(parseInt(id)))) {
        return "ID produktu musi być liczbą całkowitą.";
    }

    for (const item of orderData.items) {
        const quantity = parseInt(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            return `Ilość dla produktu ID ${item.product_id} musi być liczbą całkowitą dodatnią.`;
        }
    }

    return null;
}

function validateStatusChange(currentStatusId, newStatusId) {
    if (currentStatusId === newStatusId) {
        return "Nowy status jest identyczny z obecnym.";
    }
    if (currentStatusId === STATUS.CANCELED) {
        return "Nie można zmienić statusu ANULOWANEGO zamówienia.";
    }
    if (currentStatusId === STATUS.COMPLETED) {
        if (newStatusId === STATUS.UNCONFIRMED || newStatusId === STATUS.CONFIRMED) {
             return "Nie można cofnąć statusu ZREALIZOWANEGO zamówienia.";
        }
    }
    if (currentStatusId === STATUS.CONFIRMED && newStatusId === STATUS.UNCONFIRMED) {
        return "Nie można cofnąć zamówienia ze statusu ZATWIERDZONE na NIEZATWIERDZONE.";
    }
    if (currentStatusId === STATUS.COMPLETED && newStatusId === STATUS.CONFIRMED) {
        return "Nie można cofnąć zamówienia ze statusu ZREALIZOWANE na ZATWIERDZONE.";
    }
    return null;
}

function validateOpinion(opinionData) {
    const { rating, content } = opinionData;

    if (!rating || isNaN(parseInt(rating))) {
        return "Ocena jest wymagana i musi być liczbą całkowitą.";
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
        return "Ocena musi być liczbą całkowitą z zakresu od 1 do 5.";
    }
    
    if (!content || typeof content !== 'string' || content.trim().length < 5) {
        return "Treść opinii jest wymagana i musi zawierać co najmniej 5 znaków.";
    }

    return null;
}

exports.getAll = (req, res) => {
   Order.getAll().then(
       function(allOrders) {
           res.json(allOrders);
       }
   ).catch(err => {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas pobierania zamówień.');
    });
};

exports.getById = (req, res) => {
   Order.getById(req.params.id).then(
       function(Order) {
           res.json(Order);
       }
   ).catch(err => {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas pobierania zamówień.');
    });
};

exports.getByUser = (req, res) => {
    const userName = req.params.userName
   Order.getByUser(userName).then(orders => {
        res.status(StatusCodes.OK).json(orders);
   }
   ).catch(err => {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas pobierania zamówień.');
    });
};

exports.getByStatus = (req, res) => {
    const status = parseInt(req.params.status_id)
   Order.getByStatus(status).then(orders => {
        res.status(StatusCodes.OK).json(orders);
   }
   ).catch(err => {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas pobierania zamówień wedlug statusu.');
    });
};

exports.store = async (req, res) => {
    const orderData = req.body;
    const validationError = await validateOrderData(orderData); 

    if (validationError) {
        return problem(res, StatusCodes.BAD_REQUEST, 'Błąd walidacji danych', validationError, 'http://localhost:2323/probs/order-validation-failed');
    }

    const items = orderData.items;
    const productIds = items.map(item => item.product_id);
    const existingProducts = await ProductModel.query(qb => {
        qb.whereIn('id', productIds);
    }).fetchAll();

    if (existingProducts.length !== productIds.length) {
        const missingIds = productIds.filter(id => !existingProducts.some(p => p.get('id') == id));
        return problem(res, StatusCodes.BAD_REQUEST, 'Brak produktów', `W zamówieniu są nieistniejące produkty o ID: ${missingIds.join(', ')}.`, 'http://localhost:2323/probs/missing-products');
    }

    try {
        const result = await knex.transaction(async (trx) => {
            const newOrder = await Order.forge({
                approval_date: orderData.approval_date || null,
                status_id: orderData.status_id || 1,
                user_name: orderData.user_name,
                email: orderData.email,
                phone_number: orderData.phone_number,
            }).save(null, { transacting: trx });

            const orderId = newOrder.get('id');

            const orderItemsToInsert = items.map(item => {
                const product = existingProducts.find(p => p.get('id') == item.product_id);
                
                return {
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: product.get('price') 
                };
            });

            await OrderItem.collection(orderItemsToInsert).invokeThen('save', null, { transacting: trx, method: 'insert' });
            
            return newOrder;
        });

        res.status(StatusCodes.CREATED).json({
            message: 'Zamówienie zostało utworzone pomyślnie.',
            order: result
        });

    } catch (err) {
        console.error("Błąd podczas tworzenia zamówienia i elementów:", err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', `Wystąpił błąd serwera podczas zapisywania zamówienia. Szczegóły: ${err.message}`);
    }
};

exports.updateById = (req, res) => {
    Order.update(req.body.Order).then(
        function(Order) {
            res.json(Order);
        }
    )    
}

exports.updateStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status_id: newStatusId } = req.body;
    if (!newStatusId || isNaN(parseInt(newStatusId))) {
        return problem(res, StatusCodes.BAD_REQUEST, 'Nieprawidłowy status', "Musisz podać poprawny ID nowego statusu (status_id).", 'http://localhost:2323/probs/invalid-status-id');
    }

    try {
        const orderRecord = await Order.getById(orderId); 
        if (!orderRecord) {
            return problem(res, StatusCodes.NOT_FOUND, 'Nie znaleziono zasobu', `Zamówienie o ID ${orderId} nie zostało znalezione.`, 'http://localhost:2323/probs/order-not-found');
        }
        
        const currentStatusId = orderRecord.status_id;
        const validationError = validateStatusChange(currentStatusId, parseInt(newStatusId));
        
        if (validationError) {
            return problem(res, StatusCodes.BAD_REQUEST, 'Nieprawidłowa zmiana statusu', validationError, 'http://localhost:2323/probs/invalid-status-transition');
        }
        await Order.updateStatus(orderId, parseInt(newStatusId));
        res.status(StatusCodes.OK).json({ 
            message: `Status zamówienia ID ${orderId} został zmieniony na ${newStatusId}.` 
        });

    } catch (err) {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas aktualizacji statusu zamówienia.');
    }
};

exports.addOpinion = async (req, res) => {
    const orderId = req.params.id;
    const opinionData = req.body;
    
    const validationError = validateOpinion(opinionData);
    if (validationError) {
        return problem(res, StatusCodes.BAD_REQUEST, 'Błąd walidacji opinii', validationError, 'http://localhost:2323/probs/opinion-validation-failed');
    }

    try {
        const order = await Order.getById(orderId);
        if (!order) {
            return problem(res, StatusCodes.NOT_FOUND, 'Nie znaleziono zasobu', `Zamówienie o nr. ID: ${orderId} nie zostało znalezione.`, 'http://localhost:2323/probs/order-not-found');
        }

        const currentStatusId = order.get('status_id');
        
        if (currentStatusId !== STATUS.COMPLETED && currentStatusId !== STATUS.CANCELED) {
            return problem(res, StatusCodes.FORBIDDEN, 'Niedozwolona operacja', 'Opinię można dodać tylko do zamówienia które jest ZREALIZOWANE lub ANULOWANE.', 'http://localhost:2323/probs/opinion-status-forbidden');
        }

        const existingOpinion = await Opinion.where({ order_id: orderId }).fetch();
        if (existingOpinion) {
            return problem(res, StatusCodes.CONFLICT, 'Conflict', 'Już dodano opinię do tego zamówienia.', 'http://localhost:2323/probs/opinion-already-exists');
        }

        if (req.user && req.user.role === 'KLIENT') {
            const orderUserName = order.get('user_name');
            if (req.user.username.toLowerCase() !== orderUserName.toLowerCase()) {
                return problem(res, StatusCodes.FORBIDDEN, 'Brak uprawnień', 'Możesz dodać opinię tylko do zamówienia, które sam złożyłeś.', 'http://localhost:2323/probs/opinion-user-mismatch');
            }
        }
        
        const opinionToSave = await Opinion.forge({
            order_id: orderId,
            rating: opinionData.rating,
            content: opinionData.content,
        }).save();

        const newOpinion = await opinionToSave.save(null, { 
            method: 'insert'
        });
        
        res.status(StatusCodes.CREATED).json({
            message: 'Opinia została dodana pomyślnie.',
            opinion: newOpinion
        });

    } catch (err) {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', `Wystąpił błąd serwera podczas dodawania opinii. Szczegóły: ${err.message}`);
    }
};