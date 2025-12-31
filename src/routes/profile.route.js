const router = require("express").Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const { getUser, updateProfile, getDashboardData, uploadResume, getResumeSource } = require("../controllers/profile.controller");
const { tokenValidator } = require("../middlewares/auth/tokenValidation");

router.get("/user", tokenValidator, getUser);
router.patch("/user", tokenValidator, updateProfile);
router.get("/dashboard", tokenValidator, getDashboardData);

router.post('/resume', tokenValidator, upload.single('resume'), uploadResume);
router.get('/resume/source', tokenValidator, getResumeSource);

module.exports = router;