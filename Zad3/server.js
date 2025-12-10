const app = require('./app');

<<<<<<< HEAD
=======
require('dotenv').config();

>>>>>>> 31d6324a345c7aa3030bff5c49fe61265ee7ed8b
app.set('port', process.env.PORT || 2323);

const server = app.listen(app.get('port'), () => {
    console.log(`Product service is listening on 
    ${server.address().port}`);
    console.log(`http://localhost:2323`);
});