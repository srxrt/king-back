import express from "express";
const routerAdmin = express.Router();
import restaurantController from "./controllers/restaurant.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploader";
import orderController from "./controllers/order.controller";

// Restaurant
routerAdmin.get("/", restaurantController.goHome);
routerAdmin
  .get("/login", restaurantController.getLogin)
  .post("/login", restaurantController.processLogin);
routerAdmin
  .get("/signup", restaurantController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    restaurantController.processSignup,
  );
routerAdmin.get("/logout", restaurantController.logout);
routerAdmin.get("/check-me", restaurantController.checkAuthSession);

// Orderes
routerAdmin.get(
  "/order/all",
  restaurantController.verifyRestaurant,
  orderController.getAllOrders,
);
routerAdmin.post(
  "/order/:id",
  restaurantController.verifyRestaurant,
  orderController.updateOrderByAdmin,
);

// Products
routerAdmin.get(
  "/product/all",
  restaurantController.verifyRestaurant,
  productController.getAllProducts,
);
routerAdmin.post(
  "/product/create",
  restaurantController.verifyRestaurant,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct,
);
routerAdmin.post(
  "/product/:id",
  restaurantController.verifyRestaurant,
  productController.updateChosenProduct,
);

// Users
routerAdmin.get(
  "/user/all",
  restaurantController.verifyRestaurant,
  restaurantController.getUsers,
);
routerAdmin.post(
  "/user/edit",
  restaurantController.verifyRestaurant,
  restaurantController.updateChosenUser,
);

export default routerAdmin;
