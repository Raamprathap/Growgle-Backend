const connectDB = require("../config/connectDB");
const { sendregisterEmail, sendForgotEmail, sendWelcomeMail } = require("../middlewares/mail/mailer");
const { getPrivateKey, createToken, createRefreshToken } = require("../middlewares/auth/tokenCreation");
const paseto = require("paseto");
const bcrypt = require("bcryptjs");
const { V4: { verify } } = paseto;
const admin = require("firebase-admin");
const db = connectDB();
const User = db.collection("users");
const moment = require("moment-timezone");
const { UserSchema } = require("../Schema/userSchema");

const register = async (req, res) => {
  try {
    const parseResult = UserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Validation failed", errors: parseResult.error.errors });
    }
    const userData = parseResult.data;

    const existingUser = await User.where("email", "==", userData.email).get();

    if (!existingUser.empty) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.log("Creating user with data:", userData);

    userData.password = await bcrypt.hash(req.body.password, 10);
    userData.createdAt = moment().tz('Asia/Kolkata').toISOString();
    userData.isActive = true;

    const docRef = await db.collection("users").add(userData);
    await sendWelcomeMail(userData.email, userData.name);

    return res.status(201).json({
      message: 'User created successfully',
      data: {
        id: docRef.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Failed to create user"
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, rememberme } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userSnapshot = await User.where("email", "==", email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userSnapshot.docs[0].data();

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const userData = {
      id: userSnapshot.docs[0].id,
      email: user.email,
      name: user.name
    }

    const token = await createToken(userData); 
    const refreshToken = createRefreshToken(userData, rememberme); 

    console.log("node env", process.env.NODE_ENV);

    // Set refresh token in HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };
    if (rememberme) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
    }

    res.cookie('refreshToken', refreshToken, cookieOptions);

    console.log('Cookie options:', cookieOptions);
    delete userData.secret_key;

    res.status(201).json({ 
      message: 'User logged in successfully',
      data: { token, ...userData }
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("Failed to log in user");
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const userSnapshot = await User.where("email", "==", email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userSnapshot.docs[0].data();

    await sendForgotEmail(email, user.name);

    res.status(200).json({ 
      message: 'Password reset email sent' 
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).send("Failed to process forgot password");
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }
    const userSnapshot = await User.where("email", "==", email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userRef = userSnapshot.docs[0].ref;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({ password: hashedPassword });
    res.status(200).json({ 
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send("Failed to reset password");
  }
}

const verifyToken = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required',
      });
    }

    res.status(200).json({ 
      message: 'Token is valid',
      data: {
        email,
        name
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).send("Failed to verify token");
  }
};

const verifyMainToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const userSnapshot = await User.where("email", "==", email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Token is valid',
      data: {
        email,
        name: userSnapshot.docs[0].data().name
      },
    });
  } catch (error) {
    console.error("Error verifying main token:", error);
    res.status(500).send("Failed to verify main token");
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log("Received refresh token from cookie:", req.cookies);
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const privateKey = await getPrivateKey();
    
    const userData = await verify(refreshToken, privateKey);

    console.log("Refresh token user data:", userData);

    const newAccessToken = await createToken(userData);
    res.status(200).json({ 
      message: 'Access token refreshed',
      token: newAccessToken
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).send("Failed to refresh token");
  }
};

module.exports = {
  register,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyToken,
  verifyMainToken,
  refreshToken
};
