const bookshelf = require('../config/bookshelf');

const Opinion = bookshelf.Model.extend({
    tableName: 'opinions',
    hasTimestamps: false,
    
    product: function() {
        return this.belongsTo('Product', 'product_id');
    },
    order: function() {
        return this.belongsTo('Order', 'order_id');
    }
});

module.exports = bookshelf.model('Opinion', Opinion);