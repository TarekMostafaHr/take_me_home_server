import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import cors from "cors";
import multer from 'multer';
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

// import '@tensorflow/tfjs-node';


// import * as faceapi from 'face-api.js';

const storage = multer.diskStorage({
  destination:  __dirname + '/public/images',
  filename: function(req, file, cb){
     cb(null,"IMAGE-" + Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits:{fileSize: 1000000},
}).single("image");


const MongoStore = mongo(session);

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as testController from "./controllers/test";
import * as uploadController from "./controllers/upload_image";


// Create Express server
const app = express();

// Connect to MongoDB
// const mongoUrl = MONGODB_URI;
const mongoUrl = "mongodb://mongo:27017/test";
(<any>mongoose).Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true} ).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
    req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/test", testController.test);
app.all("/upload", upload, uploadController.upload);



export default app;
