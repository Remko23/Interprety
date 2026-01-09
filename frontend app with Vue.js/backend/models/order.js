const bookshelf= require('../config/bookshelf');

const Order = bookshelf.Model.extend({
   tableName: 'orders',
   status: function() {
       return this.belongsTo('OrderStatus', 'status_id');
   },
   items: function() {
       return this.hasMany('OrderItem', 'order_id').query((qb) => {
           qb.join('products', 'order_items.product_id', 'products.id')
             .select('order_items.*', 'products.name as product_name', 'products.price as product_price');
       });
   },
    opinion: function() {
        return this.hasOne('Opinion', 'order_id');
    }
});

module.exports = bookshelf.model('Order', Order);

const baseQuery = { withRelated: ['status', 'items', 'opinion'] };

module.exports.getAll = () => {
   return Order.fetchAll(baseQuery);
}

module.exports.getById = (id) => {
   return new Order({'id':id}).fetch(baseQuery);
}

module.exports.getByUser = (userName) => {
    return Order.where('user_name', 'LIKE', `%${userName}%`).fetchAll(baseQuery);
}

module.exports.getByStatus = (statusId) => {
    return Order.where('status_id', statusId).fetchAll(baseQuery);
}

module.exports.create = (orderData) => {
    return new Order({
        status_id: orderData.status_id,
        user_name: orderData.user_name,
        email: orderData.email,
        phone_number: orderData.phone_number,
    }).save();
};

module.exports.updateStatus = (id, newStatusId, approvalDate) => {
    return new Order({ id: id }).save({
        status_id: newStatusId,
        approval_date: approvalDate
    }, { patch: true });
}