const router = require("express").Router();
const {
    register,
    loginUser,
    forgotPassword,
    verifyToken,
    resetPassword,
    verifyMainToken,
    refreshToken,
} = require("../controllers/auth.controller");

const {
  tokenValidator,
  verifyForgotToken,
  readverifyForgotToken,
} = require("../middlewares/auth/tokenValidation");

router.post("/register", register);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", verifyForgotToken, resetPassword);
router.post("/verify-token", tokenValidator, verifyToken);
router.post("/verify-main-token", tokenValidator, verifyMainToken);
router.post("/refresh-token", refreshToken);
router.get('/verify-token-forgot',  readverifyForgotToken, verifyToken);

module.exports = router;