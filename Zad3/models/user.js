const bookshelf = require('../config/bookshelf');

const User = bookshelf.Model.extend({
   tableName: 'users',
   comparePassword: function(candidatePassword, callback) {
        const bcrypt = require('bcrypt');
        bcrypt.compare(candidatePassword, this.get('password'), function(err, isMatch) {
            if (err) return callback(err);
            callback(null, isMatch);
        });
    }
})

module.exports = bookshelf.model('User', User);

module.exports.getByLogin = (login) => {
   return new User().where({'login': login}).fetch();
}