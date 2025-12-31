require('dotenv').config();
const connectDB = require("../../config/connectDB");
const db = connectDB();
const Token = db.collection('tokens');
const paseto = require('paseto');
const { V4: {sign} } = paseto;
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const admin = require('firebase-admin');

const refresh_secret_key = process.env.REFRESH_SECRET_KEY;
const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || '7d';
const secret_key = process.env.SECRET_KEY;
const mail_secret_key = process.env.MAIL_SECRET_KEY;
const forgot_secret_key = process.env.FORGOT_SECRET_KEY;
const expiresIn = process.env.EXPIRES_IN;  
const mailexpiresIn = process.env.MAIL_EXPIRES_IN;  

const private_key_path = path.resolve(__dirname, '../rsa/private_key.pem');

async function getPrivateKey() {
    try {
        return fs.readFileSync(private_key_path);
    } catch (err) {
        console.warn(`⚠️ Private key not found or unreadable at ${private_key_path}. Using fallback value "123".`);
        return '123';
    }
}

async function createToken(data) {
    if (!secret_key) {
        throw new Error('SECRET_KEY is not defined in the environment variables.');
    }
    data.secret_key = secret_key;
    const privateKey = await getPrivateKey();
    return await sign(data, privateKey, { expiresIn });
}

async function createRefreshToken(data, rememberme) {
    if (!refresh_secret_key) {
        throw new Error('REFRESH_SECRET_KEY is not defined in the environment variables.');
    }

    const privateKey = await getPrivateKey();
    const payload = { ...data };
    payload.secret_key = refresh_secret_key;
    return await sign(payload, privateKey, { expiresIn: rememberme ? refreshExpiresIn : "1d" });
}

async function registermailtoken(data) {
    if (!mail_secret_key) {
        throw new Error('MAIL_SECRET_KEY is not defined in the environment variables.');
    }

    console.log("registermailtoken")

    data.secret_key = mail_secret_key;

    const expiresAt = admin.firestore.Timestamp.fromDate(
        moment().add(moment.duration(mailexpiresIn)).toDate()
    );

    const tokenDocRef = await Token.add({
        token: "123", 
        email: data.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt,
    });

    data.tokenId = tokenDocRef.id;

    const private_key = await getPrivateKey(); 
    let token = await sign(data, private_key, { expiresIn: mailexpiresIn });

    await Token.doc(tokenDocRef.id).update({ token });

    console.log('Updated Token:', tokenDocRef.id);

    return token;
}

async function forgotmailtoken(data) {
    if (!forgot_secret_key) {
        throw new Error('FORGOT_SECRET_KEY is not defined in the environment variables.');
    }
    console.log("forgotmailtoken")

    data.secret_key = forgot_secret_key;

    const expiresAt = admin.firestore.Timestamp.fromDate(
        moment().add(moment.duration(parseInt(mailexpiresIn), mailexpiresIn.replace(/[0-9]/g, ''))).toDate()
    );

    console.log("forgotmailtoken data",data)

    const tokenDocRef = await Token.add({
        token: "123", 
        email: data.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt,
    });

    data.tokenId = tokenDocRef.id;
    const private_key = await getPrivateKey(); 
    let token = await sign(data, private_key, { expiresIn: mailexpiresIn });

    await Token.doc(tokenDocRef.id).update({ token });

    console.log('Updated Token:', tokenDocRef.id);

    return token;
}


module.exports = { getPrivateKey, createToken, createRefreshToken, registermailtoken , forgotmailtoken };