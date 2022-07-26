const router = require("express").Router();
const cookieParser = require("cookie-parser");
const { userInfo } = require("os");
const Student = require("../models/student");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
router.use(cookieParser());

//authorize function 
const authorize = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    //status code 404 is shown when something is not found
    return res.status(404).json("Token needed");
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.json({ msg: "Failed" });
      } else {
        req.email = decoded.email;
        return next();
      }
    });
  }
};

//a post method for registration or signup
router.post("/register", async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      //422:syntax is correct but can't be processed
      return res.status(422).json({ error: "All fields are required!" });
    }
    const userexist = await Student.findOne({ email: req.body.email });
    if (userexist) {
      //401:no credentials or invalid credentials
      return res.status(401).json({ error: "Email Already Registered" });
    }
    
    //to encrypt the password use genSalt and hash function of bcrypt dependency
    //first generate a salt and using that hash the password
    //now create a newStudent object and using the info present in req body
    //save that new object in Student
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(req.body.password, salt);
    const newStudent = await new Student({
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      password: hashed,
    });
    const student = await newStudent.save();
    //200:OK,success,http response code
    res.status(200).json(student);
  } catch (err) {
    //in javascript there is only 1 catch block
    console.log(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email });

    //403:credential is there but not authorized
    if (!student) res.status(403).json("User not found");
    const validPassword = await bcrypt.compare(
      req.body.password,
      student.password
    );
    if (!validPassword) res.status(401).json("Invalid Credentials");

    const { password, ...others } = student._doc;

    const email = others.email;
    //creating a token using jwt.sign function and passing email and secret
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 100000000),
      httpOnly: true,
    });

    res.status(200).json({ token: token, data: others });
  } catch (err) {
    console.log(err);
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");

    res.status(200).json("User Logged out");
  } catch (err) {
    console.log(err);
  }
});

router.get("/studentprofile", authorize, async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.email });

    if (!student) res.status(403).json("User not found");
    else {
      const { password, ...others } = student._doc;
      res.status(200).json(others);
    }
  } catch (err) {
    console.log(err);
  }
});

//module.exports is used for exposing the functons present in this particular module to be used anywhere else
//mkaes node miodules available externally
module.exports = router;
