const Category = require('../models/category');
const { StatusCodes } = require('http-status-codes');
const { problem } = require('../utils/problem');

exports.getAll = (req, res) => {
   Category.getAll().then(
       function(allCategories) {
           res.json(allCategories);
       }
   ).catch(err => {
       console.error(err);
       return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Server Error', 'Błąd serwera podczas pobierania kategorii.');
   });
};