const bookshelf= require('../config/bookshelf');

const ProductModel = bookshelf.Model.extend({
   tableName: 'products',
   category: function() {
       return this.belongsTo('Category', 'category_id');
   }
})
const Product = bookshelf.model('Product', ProductModel);
module.exports.Model = Product;

module.exports.getAll = () => {
   return Product.fetchAll({ withRelated: ['category'] });
}

module.exports.getById = (id) => {
   return new Product({'id':id}).fetch({ withRelated: ['category'] });
}

module.exports.create = (product) => {
   return new Product({
       name: product.name,
       description: product.description,
       price: product.price,
       weight: product.weight,
       category_id: product.category_id
   }).save();
};

module.exports.update = (product) => {
   return new Product({
       id: product.id
   }).save( {
       name: product.name,
       description: product.description,
       price: product.price,
       weight: product.weight,
       category_id: product.category_id
       }, 
       {patch: true}
   );
}