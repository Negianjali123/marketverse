import { SignJWT, jwtVerify } from 'jose';
 import dotenv from 'dotenv';
dotenv.config(); 
// Use a secret from environment variables
const secretKey = process.env.SESSION_SECRET ;
const encodedKey = new TextEncoder().encode(secretKey);

// Encrypt payload into JWT token
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

// Decrypt and verify JWT token
export async function decrypt(token) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log('Failed to verify session:', error.message);
    return null;
  }
}

// Set session cookie in Express response
export async function createSession(res,userId) {
// console.log(userId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const sessionToken = await encrypt({ userId,expiresAt });
  // console.log(sessionToken);debugger;
 
  // Set cookie
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie('token', sessionToken, {
    httpOnly: true,                          // JS cannot read — prevents XSS theft
    secure: isProduction,                    // HTTPS only in production
    expires: expiresAt,
    sameSite: isProduction ? 'strict' : 'lax',  // strict in prod, lax for localhost
    path: '/',
  });
 
}

// Read and verify session from Express request cookies
export async function getSession(req) {
  const sessionToken = req.cookies?.token; 

  if (!sessionToken) return null;
  const payload = await decrypt(sessionToken);
  //  console.log('payload',payload);
  if (!payload) return null;

  // Optional: check expiration
  if (new Date(payload.expiresAt) < new Date()) return null;

  return payload;
}

