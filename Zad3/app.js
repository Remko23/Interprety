<<<<<<< HEAD
require('dotenv').config();

const express = require('express');

const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const routes = require('./routes/index');

const app = express();

=======
// załadowanie modułów dodatkowych i plików aplikacji
const express = require('express');
// moduł do obsługi routingu
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// nasz plik definiujący odpowiedzi dla ścieżek
const routes = require('./routes/index');

const app = express();
// konfiguracja parserów
>>>>>>> 31d6324a345c7aa3030bff5c49fe61265ee7ed8b
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

<<<<<<< HEAD
=======
// konfiguracja routera dla wszystkich ścieżek
>>>>>>> 31d6324a345c7aa3030bff5c49fe61265ee7ed8b
app.use('/', routes);

module.exports = app;
