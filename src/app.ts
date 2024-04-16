import createError from 'http-errors';
import express, { ErrorRequestHandler } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger, { FormatFn } from 'morgan';
import fs from 'fs';
import moment from 'moment';

import headlthzRouter from './routes/healthzRouter';
import usersRouter from './routes/userRouter';

const app = express();

const jsonFormat: FormatFn = (tokens, req, res) => {
  return JSON.stringify({
    message: `${tokens['method'](req, res)} ${tokens['url'](req, res)} api`,
    'remote-address': tokens['remote-addr'](req, res),
    timestamp: Date.now(),
    date: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
    method: tokens['method'](req, res),
    url: tokens['url'](req, res),
    'http-version': tokens['http-version'](req, res),
    'status-code': tokens['status'](req, res),
    'content-length': tokens['res'](req, res, 'content-length'),
    referrer: tokens['referrer'](req, res),
    'user-agent': tokens['user-agent'](req, res),
    'response-time': `${tokens['response-time'](req, res)} ms`,
    severity: Number(tokens['status'](req, res)) >= 400 ? 'ERROR' : 'INFO'
  });
};

export const logStream = fs.createWriteStream(path.resolve(__dirname, '../logs/access.log'), {
  flags: 'a'
});

app.use(logger(jsonFormat, { stream: logStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', function (req, res, next) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use('/api/v2/healthz', headlthzRouter);
app.use('/api/v2/user', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).send();
} as ErrorRequestHandler);

export default app;
