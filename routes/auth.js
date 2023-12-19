const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = "lOVEmE";

// Route-1 // Create a user using: POST "/api/auth/signup". No login required
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

// Route-2 // Authencate a user using: POST "/api/auth/login". No login required
router.post('/login', [
    body("email", "enter a valid email").isEmail(),
    body("password", "password can't be blank").exists()
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email })
            // return error if user does not exist
            if (!user) {
                return res.status(400).json({ errors: "Kindly login with correct credentials" })
            }
            const comparePass = await bcrypt.compare(password, user.password)
            if (!comparePass) {
                return res.status(400).json({ errors: "Kindly login with correct credentials" })
            }
            const payload = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(payload, JWT_SECRET);
            console.log(authToken)

            res.json({ authToken: authToken })


        }
        catch (error) {
            console.log(error.message);
            res.status(500).send("SOme internal error occured")
        }
    })

// Route-3 // Getting logged in user details using POST : api/auth/getUser . Login required

router.post('/getuser', fetchuser,
    async (req, res) => {
        try {
            userId = req.user.id
            const user = await User.findById(userId).select("-password");
            res.send(user)
        } catch (error) {
            console.log(error.message);
            res.status(500).send("SOme internal error occured")
        }
    }
)

module.exports = router;