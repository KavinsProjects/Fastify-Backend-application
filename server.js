require("dotenv").config();
//import cors from '@fastify/cors'
const path = require("path");
const fastifyEnv = require('@fastify/env')
const fastify = require("fastify")({ logger: true });

/*
 -> refres docs "https://github.com/fastify/fastify-cors" , 
 "https://github.com/fastify/fastify-env",
  "https://github.com/fastify/fastify-jwt"
  https://github.com/fastify/fastify-sensible

*/
//cors register
fastify.register(require("@fastify/cors"));
fastify.register(require("@fastify/sensible"));
fastify.register(require("@fastify/env"), {
    dotenv: true,
    schema: {
        type: "object",
        required: ["PORT", "MONGODB_URI", "JWT_TOKEN"],
        properties: {
            PORT: {
                type: "string",
                default: "4000"
            },

            MONGODB_URI: {
                type: "string",
            },

            JWT_TOKEN: {
                type: "string"
            }


        },
    },
});

//custom plugins
fastify.register(require("./pulgins/monogodb.plugins.js"));
//home route

fastify.get("/", function (request, reply) {
    reply.send({ hello: "kavinn" });
});

//testDB
fastify.get("/test-db", function async(request, reply){
    try {
        const mongoose = fastify.mongoose
        const connectionState = mongoose.connection.readyState

        let status = ""
        switch (connectionState) {
            case 0:
                status = "disconnected";
                break;

            case 1:
                status = "connected";
                break;

            case 2:
                status = "connecting";
                break;

            case 3:
                status = "disconnection";
                break;

            default:
                status = "unkonw";
                break
        };

        reply.send({
            database: status
        });

    }

    catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
            error: "connection failed check monogoDb connection url and check the application running"
        });
        process.exit(1);
    }
});


const serverStart = async () => {
    try {
        await fastify.listen({
            port: process.env.PORT
        });
        fastify.log.info(`server is runing on the https://localhost:${process.env.PORT}`);
    } catch (error) {
        fastify.log.error(`error while runing the server ${error}`);
        process.exit(1);
    }
}
serverStart();