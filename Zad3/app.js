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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

// konfiguracja routera dla wszystkich ścieżek
app.use('/', routes);

module.exports = app;
