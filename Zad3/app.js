require('dotenv').config();

const express = require('express');

const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const routes = require('./routes/index');

const app = express();

const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.use('/', routes);

module.exports = app;
