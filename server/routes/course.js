const router = require("express").Router();
const Course = require("../models/courses");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
router.use(cookieParser());
router.use(bodyParser.json());

router.post("/addcourse", async (req, res) => {
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

router.post("/courses", async (req, res) => {
  try {
    const topic = req.body.topic;
    Course.find({ topics: topic }, function (err, data) {
      if (err) {
        console.log(err);
        return res.send(500, "Something Went wrong with Retrieving data");
      } else {
        res.json(data);
      }
    });
  } catch (err) {
    res.status(404).json(err);
  }
});

module.exports = router;
