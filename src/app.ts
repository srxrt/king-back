import express from "express";
import http from "http";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cors from "cors";
import ConnectMongoDBSession from "connect-mongodb-session";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";
import { T } from "./libs/types/common";
import { Server as SocketIOServer } from "socket.io";

const app = express();
import session from "express-session";
const MongoDBStore = ConnectMongoDBSession(session);

const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});

// entrance
app.use(morgan(MORGAN_FORMAT));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("./uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

// sessions
app.use(
  session({
    secret: String(process.env.SESSION_SECRET),
    cookie: {
      maxAge: 1000 * 3600 * 6, // 6h
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  }),
);

app.use((req, res, next) => {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member;
  next();
});

// views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Routers
app.use("/", router);
app.use("/admin", routerAdmin); //EJS

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: true, credentials: true },
});

let summaryClient = 0;
io.on("connection", (socket: any) => {
  summaryClient++;
  console.log(`connection && total ${summaryClient}`);

  socket.on("disconnect", () => {
    summaryClient--;

    console.log(`disconnect && total ${summaryClient}`);
  });
});

export default server; // module.exports = app;
