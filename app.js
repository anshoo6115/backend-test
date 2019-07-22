const express = require('express');

const middleware = require('./api/middleware');

const userRouter = require('./api/routes/users');
const snapchatAccountRouter = require('./api/routes/snapchat/account');
const shapchatAdAccountsRouter = require('./api/routes/snapchat/adAccounts');
const snapchatMediaRouter = require('./api/routes/snapchat/media');

const app = middleware.configureMiddleware(express());

/* routes */
app.use('/users', userRouter);
app.use('/snapchat/account', snapchatAccountRouter);
app.use('/snapchat/adAccounts', shapchatAdAccountsRouter);
app.use('/snapchat/media', snapchatMediaRouter);

if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const swaggerRouter = require('./api/routes/swagger');
    app.use('/api-docs', swaggerRouter);
}

module.exports = app;
