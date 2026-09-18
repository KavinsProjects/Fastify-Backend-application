const User = require("../models/user.model.js");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");


exports.register = async (request, reply) => {
    try {
        const { name, email, password } = request.body;

        //checkpoint

        if (!email || !password) {
            return reply.code(400).send({
                message: "Email and password are required"
            });
        }
        const hasedPasswd = await bcrypt.hash(password, 12);
        const user = new User({ name, email, password: hasedPasswd });
        await user.save();
        reply.code(201).send({ message: "user registed sucessfully" });

    } catch (err) {
        reply.code(500).send({ message: "error while registering the user", err});
        //remove the pushing the code
        console.log(err);
    }
}

exports.login = async (request, reply) => {
    try {
        const { email, password } = request.body;

        //    if(!email || !password){
        //     return reply.code(400).send({
        //         message : "Email and password are required"
        //     });
        //  }


        const user = await User.findOne({ email });
        if (!user) {
            return reply.code(404).send({ message: "Maybe Invaild email are password" });
        }

        //validate_passwd
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return reply.cod(400).send({ message: "Maybe Invaild email are password" });
        }

        const token = request.server.jwt.sign({ id: user._id });
        reply.send(token);


        //validate if fails
    } catch (error) {
        reply.code(500).send({ message: "Error while logging in" });
        console.log(err);
    }
}

//
exports.forgotPassword = async (request, reply) => {
    try {
        const { email } = request.body;
        await User.findOne({ email });
        if (!User) {
            return reply.notFound("User not found");
        }

        //reset token
        const reSetToken = crypto.randomBytes(32).toString("hex");
        const restPasswdExpire = Date.now() + 10 * 60 * 10000; // 10 min

        //saving in db
        user.resetPasswdToken = reSetToken;
        user.resetPasswdExpiry = restPasswdExpire;

        await user.save({ validateBerforeSave: false });

        const reSetPasswsUrl = `http://localhost:${process.env.PORT}/api/auth/passwd-reset/${reSetToken}`;

        reply.send({ reSetPasswsUrl });


    } catch (error) {
        reply.code(500).send({ message: "Error" });
        console.log(err);
    }
}

exports.resetPassword = async (request, reply) => {
    const resetToken = request.params.token;
    const {newPassword} = request.body

    const user = await User.findOne({
        resetPasswdToken : resetToken,
        resetPasswdExpiry : ({$gt: Date.now() }),
    });

    if(!user){
        return reply.badRequest("Invaild are exprired passwrord reset");
    }

    //hast the passwd
    const hasedPasswd = await bcrypt.hash(newPassword, 12);
    user.password = hasedPasswd;
    user.resetPasswdExpiry = undefined;
    user.resetPasswdToken = undefined;

    
    await user.save();
    reply.send({message : "passwd reset sucessfully"});
    console.log(err);
}   

//logout 
exports.logout = async(request, reply)=>{
    reply.send({message : "user loged out "});

}