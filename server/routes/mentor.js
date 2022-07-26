const router = require("express").Router();
const Mentor = require("../models/mentor");

const cookieParser = require("cookie-parser");
router.use(cookieParser());

//post method for adding new mentor
router.post("/addMentor", async (req, res) => {
  try {
    const newCourse = await new Course({
      name: req.body.name,
    });
    const course = await newCourse.save();
    res.status(200).json(course);
  } catch (err) {
    console.log(err);
  }
});

//get method for getting details of a mentor
router.get("/mentor/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    Mentor.findById(req.params.id, function (err, data) {
      if (err) {
        console.log(err);
        return res.send(500, "Something Went wrong with Retrieving data");
      } else {
        res.json(data);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(404).json(err);
  }
});

//post request for getting all mentors of a particular topic
router.post("/mentors", async (req, res) => {
  try {
    const topic = req.body.topic;
    Mentor.find({ topics: topic }, function (err, data) {
      if (err) {
        console.log(err);
        return res.send(500, "Something Went wrong with Retrieving data");
      } else {
        res.json(data);
      }
    });
  } catch (err) {
    res.status(405).json(err);
  }
});

module.exports = router;
