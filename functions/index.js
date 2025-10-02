const functions = require('firebase-functions')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')

admin.initializeApp()
const db = admin.firestore();
const auth = admin.auth();


// configure your email sender
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply@etickets.asia',
    pass: 'yudp jeeq rddp hpwm' // use app password, not real password
  }
})
exports.sendEmailOtp = functions.https.onCall(async (data, context) => {
    const email = data.data.email;

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required')
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 5 * 60 * 1000)
  )

  try {
    await admin.firestore().collection('emailOtps').doc(email).set({
      code: otp,
      expiresAt,
      verified: false
    })

    await transporter.sendMail({
      from: 'noreply@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    })

    return { success: true }
  } catch (err) {
    console.error('Error sending OTP:', err)
    throw new functions.https.HttpsError('internal', 'Failed to send OTP')
  }
})

exports.verifyEmailOtp = functions.https.onCall(async (data, context) => {
    const { email, otp } = data.data;

    const doc = await admin.firestore().collection('emailOtps').doc(email).get();
    if (!doc.exists) return { success: false, message: 'No OTP sent' };

    const dataDb = doc.data();
    const savedOtp = dataDb.code; // Make sure this matches the key in sendEmailOtp
    const expiresAt = dataDb.expiresAt;

    if (!expiresAt) {
        return { success: false, message: 'OTP has no expiration date' };
    }

    const now = new Date();
    if (expiresAt.toDate() < now) {
        return { success: false, message: 'OTP expired' };
    }
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (err) {
      userRecord = await admin.auth().createUser({ email });
    }
    const uid = userRecord.uid;


    if (otp === savedOtp) {
        const token = await admin.auth().createCustomToken(uid);  
        await doc.ref.update({ verified: true }); 
        return {
          success: true,
          token,
          user: {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || null,
          },
        };
    } else {
        return { success: false, message: 'Invalid OTP' };
    }
});


