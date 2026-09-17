
const fp = require("fastify-plugin");
const mongoose = require("mongoose");


module.exports = fp(async(fastify, Option)=>{

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        fastify.decorate("mongoose", mongoose);
        fastify.log.info(`mongodb is connected`);
    } catch (error) {
        fastify.log.error(`There is issue in the connecting the to monogodb `);
        process.exit(1);
    }
});