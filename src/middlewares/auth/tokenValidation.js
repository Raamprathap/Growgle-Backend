require("dotenv").config();
const connectDB = require("../../config/connectDB");
const db = connectDB();
const Token = db.collection("tokens");
const paseto = require("paseto");
const {
  V4: { verify },
} = paseto;
const fs = require("fs");
const path = require("path");

// Environment variables for secret keys
const secret_key = process.env.SECRET_KEY;
const mail_secret_key = process.env.MAIL_SECRET_KEY;
const forgot_secret_key = process.env.FORGOT_SECRET_KEY;

// Load the public key from the file
const public_key_path = path.resolve(__dirname, "../rsa/public_key.pem");

function getPublicKey() {
  try {
    return fs.readFileSync(public_key_path);
  } catch (err) {
    console.warn(
      `⚠️ Public key not found or unreadable at ${public_key_path}. Using fallback value "123".`
    );
    return "123";
  }
}

// Token verification for "create" token
async function tokenValidator(req, res, next) {
    console.log("tokenValidator")
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        console.log("No token provided"); 
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
            const public_key = getPublicKey();
              const payload = await verify(token, public_key);
        
        if (!req.body) {
            req.body = {};  
        } 

        if (payload && payload.secret_key === secret_key) {
            req.body.userid = payload.userid,
            req.body.email = payload.email;
            req.body.userId = payload.id;
            req.body.name = payload.name;
            req.body.role = payload.role;


            console.log("Token payload:", payload);
            console.log("User details added to request body:"); 
            return next();  

        } else {
            console.log("Invalid token payload:", payload);
            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
        console.log("Token verification error:", err.message);
        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}

// Token verification for "create" token
async function admintokenValidator(req, res, next) {
    console.log("admintokenValidator")
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        console.log("No token provided"); 
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
            const public_key = getPublicKey();
              const payload = await verify(token, public_key);
        
        if (!req.body) {
            req.body = {};  
        }


        if (payload && payload.secret_key === secret_key) {

            req.body.email = payload.email;
            req.body.userId = payload.id;
            req.body.name = payload.name;
            req.body.role = payload.role; 


    
            console.log("Token payload:", payload);
            console.log("User details added to request body:");
            console.log("User role:", payload.role); 
            if (payload.role !== 'admin') {
                return res.status(401).send({ message: 'You are not authorized to access this resource.' });
            }
            
            next();
        } else {
            console.log("Invalid token payload:", payload); 
            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
        console.error("Token verification error:", err.message);
        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}

async function readverifyForgotToken(req, res, next) {
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(" ")[1];

  console.log("Received token:", token);

  if (!token) {
    return res.status(401).send({ MESSAGE: "Missing or invalid token." });
  }

  try {
    const snapshot = await Token.where("token", "==", token).limit(1).get();
    const existingToken = !snapshot.empty ? snapshot.docs[0].data() : null;
    console.log("Token found in database:", existingToken);

    if (!existingToken) {
      return res
        .status(401)
        .send({
          MESSAGE: "Token not found in database or has already been used.",
        });
    }

    const public_key = getPublicKey();
    const payload = await verify(token, public_key);

    if (!req.body) {
      req.body = {};
    }
    console.log("Decoded payload:", payload);

    if (payload && payload.secret_key === forgot_secret_key) {
      req.body = req.body || {};

      req.body.email = payload.email;
      req.body.name = payload.name;

      console.log("User details added to request body:", req.body);

      next();
    } else {
      return res.status(401).send({ MESSAGE: "Invalid token payload." });
    }
  } catch (err) {
    console.error("Error verifying token:", err.message);

    return res
      .status(401)
      .send({ MESSAGE: "Invalid or expired token: " + err.message });
  }
}

// Token verification for "forgot" token
async function verifyForgotToken(req, res, next) {
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ MESSAGE: "Missing or invalid token." });
  }

  try {
    const public_key = getPublicKey();
    const payload = await verify(token, public_key);

    if (!req.body) {
      req.body = {};
    }

    if (payload && payload.secret_key === forgot_secret_key) {
      const snapshot = await Token.where("token", "==", token).limit(1).get();
      if (snapshot.empty) {
        return res
          .status(401)
          .send({ MESSAGE: "Token has already been used or expired." });
      }
      const docId = snapshot.docs[0].id;

      req.body.email = payload.email;
      req.body.name = payload.name;

      await Token.doc(docId).delete();

      next();
    } else {
      return res.status(401).send({ MESSAGE: "Invalid forgot token payload." });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).send({ MESSAGE: "Forgot token has expired." });
    }

    return res
      .status(401)
      .send({ MESSAGE: "Invalid or expired forgot token: " + err.message });
  }
}

module.exports = {
  tokenValidator,
  verifyForgotToken,
  readverifyForgotToken,
  admintokenValidator,
};
