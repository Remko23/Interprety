const OrderStatus = require('../models/orderStatus');
const { StatusCodes } = require('http-status-codes');
const { problem } = require('../utils/problem');

exports.getAll = (req, res) => {
   OrderStatus.getAll()
   .then(allStatuses => {
       res.status(StatusCodes.OK).json(allStatuses);
   })
   .catch(err => {
       console.error(err);
       return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas pobierania stanów zamówień.');
   });
};