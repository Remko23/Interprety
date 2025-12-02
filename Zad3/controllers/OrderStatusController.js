const OrderStatus = require('../models/orderStatus');
const { StatusCodes } = require('http-status-codes');

exports.getAll = (req, res) => {
   OrderStatus.getAll()
   .then(allStatuses => {
       res.status(StatusCodes.OK).json(allStatuses);
   })
   .catch(err => {
       console.error(err);
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Błąd serwera podczas pobierania stanów zamówień.' });
   });
};