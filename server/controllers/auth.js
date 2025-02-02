const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.registerUser = async (req, res) => {
    const newUser = req.body;

    try {
        const takenUsername = await user.findOne({username: newUser.username})
        //console.log(takenUsername)
        const takenUserEmail = await user.findOne({email: newUser.email})
        if(takenUsername || takenUserEmail)
        {
                return res.status(403).send({message: "Username or Email already registered!."})
        }
        else{
        const salt = await bcrypt.genSalt(10)
        newUser.password= await bcrypt.hash(req.body.password, salt)
        const dbUser = new user({
            username: newUser.username.toLowerCase(),
            email: newUser.email.toLowerCase(),
            password: newUser.password,
        })
        dbUser.save()
        return res.status(201).send({message: "Successfully registered new user"});
    } 
}
catch (error) {
        console.error(error.message)
        return res.status(400).send({message: 'Error registering user!'})
    }
}


exports.loginUser = async (req,res) =>
    {
        try
        {
            
        
        const userLogginIn = req.body;
        const existingUser = await user.findOne({username: userLogginIn.username})
        if(!existingUser)
            {
                return res.status(401).send({message: "Invalid username or password"})
            }
           const isPasswordCorrect = await bcrypt.compare(userLogginIn.password, existingUser.password)
           if(isPasswordCorrect)
            {
                const payLoad = 
                {
                    id: existingUser._id,
                    username: existingUser.username
                }
               jwt.sign(
                    payLoad, 
                    process.env.AUTH_SECRET,
                    {expiresIn: 3*24*60*60},
                    (err, token) => 
                        {
                            if(err)
                                {
                                    return res.status(400).send({message: err.message})
                                }
                                return res.status(200).send(
                                    {
                                        message: "Success",
                                        token: "Bearer " + token 
                                    }
                                )
                        }
                )
            }
            else
            {
                return res.status(401).send({message: "Invalid username or password"})
            }
        }
        catch(error)
        {
            console.log(error.message)
            return res.status(400).send({message: "Error Logging in user"})
        }
    }
