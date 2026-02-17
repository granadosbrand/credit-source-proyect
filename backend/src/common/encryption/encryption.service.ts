import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly encryptionKey: Buffer;
    private readonly algorithm = 'aes-256-gcm';
    private readonly salt = 'credit-source-salt-2026'; // En producción, usar variable env

    constructor() {
        // Derivar key de una contraseña usando scrypt
        const password = process.env.ENCRYPTION_PASSWORD || 'default-credit-source-key-2026';
        this.encryptionKey = scryptSync(password, this.salt, 32);
    }

    encrypt(text: string): string {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);

        let encrypted = cipher.update(text, 'utf-8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Combinar: iv + authTag + encrypted (todo en hex)
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    decrypt(encryptedText: string): string {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');

        return decrypted;
    }
}
