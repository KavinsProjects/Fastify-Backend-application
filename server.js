require("dotenv").config();
//import cors from '@fastify/cors'
const path = require("path");
const fastifyEnv = require('@fastify/env')
const fastify = require("fastify")({logger : true});

/*
 -> refres docs "https://github.com/fastify/fastify-cors" , 
 "https://github.com/fastify/fastify-env",
  "https://github.com/fastify/fastify-jwt"
  https://github.com/fastify/fastify-sensible

*/
//cors register
fastify.register(require("@fastify/cors"));
fastify.register(require("@fastify/sensible"));
fastify.register(require("@fastify/env"),{
    dotenv : true,
    schema : {
        type : "object",
        required : [ "PORT", "MONGODB_URI", "JWT_TOKEN" ],
        properties : {
            PORT : {
                type : "string",
                default : "4000"
            },
            
            MONGODB_URI : {
                type : "string",
            },

            JWT_TOKEN : {
                type : "string"
            }

            
        },
    },
});


//home route

fastify.get("/",function(request, reply) {
    reply.send({hello : "kavinn"});
});


const serverStart = async()=>{
    try {
        await fastify.listen({
            port:process.env.PORT
        });
        fastify.log.info(`server is runing on the https://localhost:${process.env.PORT}`);
    } catch (error) {
        fastify.log.error(`error while runing the server ${error}`);
        process.exit(1);
    }
}
serverStart();