const thumbnailController = require("../controllers/thumbnail.controller.js");

module.exports = async function (fastify, opts){
    fastify.register(async function(fastify){
        fastify.addHook("perHandler", fastify.authenticate);

        fastify.post("/", thumbnailController.createThumbnail);
        fastify.get("/",thumbnailController.getThumnnails );
        fastify.get("/:id",thumbnailController.getThumnnail);
        fastify.put("/:id", thumbnailController.updateThumbnail);
        fastify.delete("/:id", thumbnailController.deleteThumbnail);
        fastify.delete("/", thumbnailController.deleteAllThumbnail);

    })
}