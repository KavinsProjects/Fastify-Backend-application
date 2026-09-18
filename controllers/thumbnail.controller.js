const Thumbnail = require("../models/thumbnail.model.js");
const path = require("path");
const fs = require("fs");
const { pipeline } = require("stream");
const util = require("util");
const { request } = require("http");
const { default: fastify } = require("fastify");
const pipelineAsync = until.promisify(pipeline);

exports.createThumbnail = async (request, reply) => {
    try {
        //
        const parts = request.parts()
        let fields = {};
        let filename;

        for await (const part of part) {
            if (part.file) {
                //saveing the fileName
                const filename = `${Date.now()}-${part.filename}`
                //saveing the path "../uploads/thumbnail"->folder
                const saveTo = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    "thumbnail",
                    filename
                );
                await pipelineAsync(path.file, fs.createWriteStream(saveTo)); //saveing in the server file 
            } else {
                fields[part.filename] = parts.value;
            }
        }

        const thumbnail = new Thumbnail({
            user: request.user.id,
            videoName: fields.videoName,
            version: fields.version,
            image: `/uploads/thumbnail/${filename}`,
            paid: fields.paid === "true"

        });
        await thumbnail.save();
        reply.code(201).send(thumbnail);
    } catch (error) {
        reply.send(error);
        console.log(error);
    }
}

exports.getThumnnails = async (request, reply) => {
    try {
        const thumbnails = await Thumbnail.find({ user: request.user.id });
        reply.send(thumbnails)
    } catch (error) {
        reply.send(error);
        console.log(error);
    }
}


exports.getThumnnail = async (request, reply) => {
    try {
        const thumbnail = await Thumbnail.findOne({
            _id: request.params.id,
            user: request.user.id
        });
        if (!thumbnail) {
            return reply.notFound("Thumbnail Not Found");
        }
        reply.send(thumbnail)
    } catch (error) {
        reply.send(error);
        console.log(error);
    }
};

exports.updateThumbnail = async (request, reply) => {
    try {
        const updateData = request.body
        const thumbnail = await Thumbnail.findByIdAndUpdate(
            { _id: request.params.id, user: request.user.id },
            updateData,
            { new: true }
        )
        if (!thumbnail) {
            return reply.notFound("Thumbnail Not Found");
        }
        reply.send(thumbnail);

    } catch (error) {
        reply.send(error);
        console.log(error);
    }
};
//deleteing from the db
exports.deleteThumbnail = async (request, reply) => {
    try {
        const thumbnail = await Thumbnail.findByIdAndDelete({
            _id: request.params.id, user: request.user.id
        });

        if (!thumbnail) {
            return reply.notFound("Thunbnail not found");
        }
        //deleting from the local
        const filepath = path.join(
            __dirname,
            "..",
            "uploads",
            "thumbnail",
            path.basename(thumbnail.image)
        );
        fs.unlink(filepath, (err) => {
            if (err) fastify.log.error(err);
        });
    }

    catch (error) {
        reply.send(error);
        console.log(error);
    }
}

reply.send({message : "Thubnail deleted"});


exports.deleteAllThumbnail = async (request, reply) => {
    try {
        const thumbnails = await Thumbnail.find({user: request.user.id})

        await Thumbnail.deleteMany({user: request.user.id});

        for(const thunbnail of Thumbnail ){
            const filepath = path.join(
            __dirname,
            "..",
            "uploads",
            "thumbnail",
            path.basename(thumbnail.image)
        );
        fs.unlink(filepath, (err) => {
            if (err) fastify.log.error(err);
        });

        }

    reply.send({message : "All thumpnail was deleted"})
    } catch (error) {
        reply.send(error);
        console.log(error);
    }
}