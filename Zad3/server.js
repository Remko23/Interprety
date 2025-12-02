const app = require('./app');

require('dotenv').config();

app.set('port', process.env.PORT || 2323);

const server = app.listen(app.get('port'), () => {
    console.log(`Product service is listening on 
    ${server.address().port}`);
    console.log(`http://localhost:2323`);
});