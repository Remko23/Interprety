const bookshelf= require('../config/bookshelf');

const OrderStatus = bookshelf.Model.extend({
   tableName: 'order_statuses',
   orders: function() {
       return this.hasMany('Order', 'status_id');
   }
});

const OrderStatusModel = bookshelf.model('OrderStatus', OrderStatus);

module.exports = {
    OrderStatusModel,
    getAll: () => {
        return OrderStatusModel.fetchAll();
    }
};