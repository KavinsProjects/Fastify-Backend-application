const authController = require("../controllers/authController.js");
const fastify = require("fastify");


module.exports = async function (fastify, otps) {
    //rotues

    fastify.post("/register", authController.register),
        fastify.post("/login", authController.login),
        fastify.post("/forgot-Password", authController.forgotPassword),
        fastify.post("/rest-password/:token", authController.resetPassword);
    //only logined in user are allowed to logout (common sense!) 
    // prehandller
    fastify.post("/logout",

        {
            preHandler: [fastify.authenticate]
        },)
};