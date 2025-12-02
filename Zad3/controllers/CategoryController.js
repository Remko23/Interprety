const Category = require('../models/category');
const { StatusCodes } = require('http-status-codes');

exports.getAll = (req, res) => {
   Category.getAll().then(
       function(allCategories) {
           res.json(allCategories);
       }
   ).catch(err => {
       console.error(err);
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Błąd serwera podczas pobierania kategorii.' });
   });
};