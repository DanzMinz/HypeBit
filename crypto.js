// crypto.js - Шифрование для HYPEBIT Messenger
// Использует AES-256 для сообщений и файлов

// Секретный ключ приложения (в реальном проекте должен быть сложнее)
const APP_SECRET = 'hypebit-secure-messenger-2024';

// Класс для управления шифрованием
class HypebitCrypto {
    constructor() {
        this.encryptionEnabled = true;
        this.sessionKeys = new Map(); // Кэш ключей для чатов
    }

    // Генерация уникального ключа для чата
    generateChatKey(chatId, userId) {
        try {
            const salt = chatId + userId + APP_SECRET;
            return CryptoJS.SHA256(salt).toString();
        } catch (error) {
            console.error('Key generation error:', error);
            return null;
        }
    }

    // Шифрование сообщения
    encryptMessage(text, chatId, userId) {
        try {
            if (!text || !chatId || !userId) {
                throw new Error('Missing encryption parameters');
            }

            // Получаем ключ для чата
            const chatKey = this.generateChatKey(chatId, userId);
            
            // Генерируем случайный IV (вектор инициализации)
            const iv = CryptoJS.lib.WordArray.random(16);
            
            // Шифруем
            const encrypted = CryptoJS.AES.encrypt(text, chatKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            // Сохраняем IV вместе с зашифрованным текстом
            const result = {
                iv: iv.toString(CryptoJS.enc.Base64),
                data: encrypted.toString(),
                timestamp: Date.now()
            };

            // Возвращаем JSON строку
            return JSON.stringify(result);
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    // Дешифровка сообщения
    decryptMessage(encryptedData, chatId, userId) {
        try {
            if (!encryptedData || !chatId || !userId) {
                throw new Error('Missing decryption parameters');
            }

            // Парсим JSON
            const data = JSON.parse(encryptedData);
            
            // Получаем ключ для чата
            const chatKey = this.generateChatKey(chatId, userId);
            
            // Восстанавливаем IV
            const iv = CryptoJS.enc.Base64.parse(data.iv);
            
            // Дешифруем
            const decrypted = CryptoJS.AES.decrypt(data.data, chatKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption error:', error);
            return '[Encrypted message - cannot decrypt]';
        }
    }

    // Шифрование файла (для метаданных)
    encryptFileMetadata(fileName, fileSize, fileType, chatId, userId) {
        try {
            const metadata = {
                name: fileName,
                size: fileSize,
                type: fileType,
                uploaded: Date.now()
            };

            const metadataStr = JSON.stringify(metadata);
            const chatKey = this.generateChatKey(chatId, userId);
            
            return CryptoJS.AES.encrypt(metadataStr, chatKey).toString();
        } catch (error) {
            console.error('File metadata encryption error:', error);
            return null;
        }
    }

    // Дешифровка метаданных файла
    decryptFileMetadata(encryptedMetadata, chatId, userId) {
        try {
            const chatKey = this.generateChatKey(chatId, userId);
            const decrypted = CryptoJS.AES.decrypt(encryptedMetadata, chatKey);
            const metadataStr = decrypted.toString(CryptoJS.enc.Utf8);
            
            return JSON.parse(metadataStr);
        } catch (error) {
            console.error('File metadata decryption error:', error);
            return null;
        }
    }

    // Хеширование сообщения для проверки целостности
    hashMessage(text, chatId) {
        try {
            const data = text + chatId + APP_SECRET;
            return CryptoJS.SHA256(data).toString();
        } catch (error) {
            console.error('Hashing error:', error);
            return null;
        }
    }

    // Проверка целостности сообщения
    verifyMessage(text, hash, chatId) {
        try {
            const computedHash = this.hashMessage(text, chatId);
            return computedHash === hash;
        } catch (error) {
            console.error('Verification error:', error);
            return false;
        }
    }

    // Шифрование приватных данных пользователя
    encryptUserData(userData, userId) {
        try {
            const userKey = CryptoJS.SHA256(userId + APP_SECRET).toString();
            const dataStr = JSON.stringify(userData);
            
            return CryptoJS.AES.encrypt(dataStr, userKey).toString();
        } catch (error) {
            console.error('User data encryption error:', error);
            return null;
        }
    }

    // Дешифровка данных пользователя
    decryptUserData(encryptedData, userId) {
        try {
            const userKey = CryptoJS.SHA256(userId + APP_SECRET).toString();
            const decrypted = CryptoJS.AES.decrypt(encryptedData, userKey);
            const dataStr = decrypted.toString(CryptoJS.enc.Utf8);
            
            return JSON.parse(dataStr);
        } catch (error) {
            console.error('User data decryption error:', error);
            return null;
        }
    }

    // Генерация ключа для E2E шифрования (будущее)
    generateE2EKeyPair() {
        // Здесь будет генерация ключей для end-to-end шифрования
        // Пока заглушка
        return {
            publicKey: 'temp-public-key',
            privateKey: 'temp-private-key'
        };
    }

    // Сброс сессионных ключей
    clearSessionKeys() {
        this.sessionKeys.clear();
        console.log('Session keys cleared');
    }

    // Проверка статуса шифрования
    getEncryptionStatus() {
        return {
            enabled: this.encryptionEnabled,
            algorithm: 'AES-256-CBC',
            hashing: 'SHA-256',
            sessionKeysCount: this.sessionKeys.size
        };
    }
}

// Создаем глобальный экземпляр
const hypebitCrypto = new HypebitCrypto();

// Функции для обратной совместимости
function encryptMessage(text, chatId, userId) {
    return hypebitCrypto.encryptMessage(text, chatId, userId);
}

function decryptMessage(encryptedData, chatId, userId) {
    return hypebitCrypto.decryptMessage(encryptedData, chatId, userId);
}

// Экспортируем для использования
console.log('✅ HYPEBIT Crypto module loaded');