import * as CryptoJS from 'crypto-js'
// import { console } from 'inspector';

// const secretKey = process.env.SESSION_SECRET ? process.env.SESSION_SECRET : '12345'

const secretKey = '12345';
export const encrypt = (plainText) => {
  const text = JSON.stringify(plainText);
    const cipherText = CryptoJS.AES.encrypt(plainText, secretKey).toString()
    return cipherText
}

export const decrypt = (cipherText) => {
  if (!cipherText || typeof cipherText !== 'string') {
    console.log('Invalid cipherText:', cipherText);
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const plainText = bytes.toString(CryptoJS.enc.Utf8);

    if (!plainText) {
      console.log('Decryption failed, possibly wrong key or corrupt ciphertext.');
      return null;
    }

    return plainText;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};
