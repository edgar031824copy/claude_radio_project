const { Router } = require("express");
const {
  getRatingsForSong,
  rateSong,
} = require("../controllers/ratingsController");

const router = Router();

router.get("/", getRatingsForSong);
router.post("/");

module.exports = router;
