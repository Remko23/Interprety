const bookshelf = require('../config/bookshelf');

const OrderItem = bookshelf.Model.extend({
    tableName: 'order_items',
    hasTimestamps: false,
    
    product: function() {
        return this.belongsTo('Product', 'product_id');
    },
    order: function() {
        return this.belongsTo('Order', 'order_id');
    }
});

module.exports = bookshelf.model('OrderItem', OrderItem);