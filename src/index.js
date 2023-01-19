const expres = require("express");
const cors = require("cors");
const { connect } = require("./config/db.config");
require('dotenv').config();
const app = expres();
const port = process.env.PORT
app.use(cors())
app.use(expres.json())
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const userModel = require("./model/user.model");


app.get('/',async(req,res)=>{
    res.send('welcome to home page')
})

app.post("/signup", async (req, res) => {
    const email_users = await userModel.find({
      email: req.body.email,
    });
    if (email_users.length >= 1) {
      res.status(404).json({
        message: "EmailID already exists",
      });
    } else {
        try {
          const hash = await argon2.hash(req.body.password);
          const new_user = new userModel({
            password: hash,
            email: req.body.email,
          });
          const created_users = await new_user.save();
  
          res.status(201).json({
            message: "User created successfully",
          });
        } catch (error) {
          res.status(404).json({
            error: error,
          });
        }
    }
  });
  
  
  
  app.post("/login", async (req, res) => {
    try {
      const user = await userModel.find({ email: req.body.email });
      if (user.length >= 1) {
        if (await argon2.verify(user[0].password, req.body.password)) {
          const access_token = jwt.sign(
            {
              id: user[0]._id,
              email: user[0].email,
              password: user[0].password,
            },
            process.env.SECRET_KEY,
            {
              expiresIn: "1d",
            }
          );
          
          res.status(200).json({
            AccessToken: access_token
          });
        } else {
          res.status(403).json({
            message: "YOUR PASSWORD IS INCORRECT",
          });
        }
      } else {
        res.status(404).json({
          message: "NO USER NOT FOUND",
        });
      }
    } catch (error) {
      res.status(404).json({
        error: "EMAIL OR PASSWORD IS INCORRECT",
      });
    }
  });


app.listen(port,async()=>{
    await connect();
    console.log(`listening on http://localhost:${port}`)
})