import JSEncrypt from 'jsencrypt';
import { RSA_PUBLIC_KEY } from '../config/rsaKeys';

/**
 * Cifra un texto usando RSA con la clave pública del backend
 * @param {string} text - Texto plano a cifrar (ej. contraseña)
 * @returns {string} - Texto cifrado en Base64
 */
export const encryptRSA = (text) => {
  try {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(RSA_PUBLIC_KEY);
    const encrypted = encrypt.encrypt(text);
    
    if (!encrypted) {
      throw new Error('Error al cifrar con RSA');
    }
    
    return encrypted;
  } catch (error) {
    console.error('[rsaEncrypt] Error cifrando:', error);
    throw error;
  }
};
