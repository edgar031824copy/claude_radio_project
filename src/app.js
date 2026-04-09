const express = require('express');
const path    = require('path');

const ratingsRouter = require('./routes/ratings');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/ratings', ratingsRouter);

module.exports = app;
