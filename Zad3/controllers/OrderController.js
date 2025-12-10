const Order = require('../models/order');
const Product = require('../models/product');
const OrderItem = require('../models/orderItem');
const knex = require('knex')(require('../config/knexfile'));
const { StatusCodes } = require('http-status-codes');
const { problem } = require('../utils/problem');
const order = require('../models/order');

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
    const existingProducts = await Product.query(qb => {
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

            await OrderItem.collection(orderItemsToInsert).invokeThen('save', null, { transacting: trx });
            
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