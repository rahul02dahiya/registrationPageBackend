const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const JWT_SECRET = "lOVEmE";

router.post('/signup', [
    body("password", "enter a valid pass").isLength({ min: 5 }),
    body("email", "enter a valid email").isEmail(),
    body("name", "Enter a valid name").isLength({ min: 3 })
], async (req, res) => {


    // If there are errors return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {

        if(req.body.password != req.body.confirm_password){
            return res.json({errors:{"confirm_password":"COnfirm password should be same as password"}});
        }

        let user = await User.findOne({ email: req.body.email });
        // Check weather the user is already exist
        if (user) {
            return res.status(400).json({ errors: "Sorry a user is already exist with same email" })
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        console.log(authToken)

        res.json({ authToken: authToken })
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send("SOme error occured")
    }

})

module.exports = router;