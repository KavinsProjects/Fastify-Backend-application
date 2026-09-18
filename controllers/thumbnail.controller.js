const Thumbnail = require("../models/thumbnail.model.js");
const path = require("path");
const fs = require("fs");
const { pipeline } = require("stream");
const util = require("util");
const { request } = require("http");
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
            user : request.user.id,
            videoName : fields.videoName,
            version : fields.version,
            image : `/uploads/thumbnail/${filename}`,
            paid : fields.paid === "true"

        });
        await thumbnail.save();
        reply.code(201).send(thumbnail);
    } catch (error) {
        reply.send(error);
        console.log(error);
    }
}