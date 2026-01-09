const bookshelf= require('../config/bookshelf');

const Category = bookshelf.Model.extend({
   tableName: 'categories',
   products: function() {
       return this.hasMany('Product', 'category_id');
   }
})

module.exports = bookshelf.model('Category', Category);

module.exports.getAll = () => {
   return Category.fetchAll();
}