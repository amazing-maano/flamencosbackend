require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const logger = require('morgan');

const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origins: '*',
    methods: '*',
  },
});
// const cors = require('cors');

require('./config/passport')(passport);

const { mongodb_uri, port, base_url } = require('./config/environment');

// Calling routes
const authentication = require('./routes/auth');
const profile = require('./routes/profile');
const product = require('./routes/product');
const notification = require('./routes/notification');
const taxonomies = require('./routes/taxonomies');
const reviews = require('./routes/reviews');
const recommendations = require('./routes/recommendations');
const orders = require('./routes/orders');
const admin = require('./routes/admin');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
const possibleOrigins = [
  process.env.CORS_ORIGIN_LOCAL,
  process.env.CORS_ORIGIN_FIREBASE,
  process.env.CORS_ORIGIN_NETLIFY,
];
/*
const corsOptions = {
  origin: possibleOrigins,
  credentials: true, // access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
// app.use(cors(corsOptions));
*/
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH, OPTIONS');
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (_, res) => {
  res.send('Flamencos!');
});

// Using routes
app.use('/', authentication);
app.use('/', profile);
app.use('/', product);
app.use('/', orders);
app.use('/', notification);
app.use('/', taxonomies);
app.use('/', reviews);
app.use('/', recommendations);
app.use('/', admin);

let interval;

mongoose
  .connect(mongodb_uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connected');
    http.listen(process.env.PORT || port, () => {
      console.log(`Flamencos is listening at ${base_url}`);
    });
    const getApiAndEmit = (socket) => {
      const data = new Date();
      // Emitting a new message. Will be consumed by the client
      socket.emit('FromAPI', data);
    };
    io.on('connection', (socket) => {
      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(() => getApiAndEmit(socket), 1000);
      socket.on('disconnect', () => {
        clearInterval(interval);
      });
    });
  })
  .catch((err) => {
    console.log(`DB connection error: ${err.message}`);
  });
module.exports = app;
