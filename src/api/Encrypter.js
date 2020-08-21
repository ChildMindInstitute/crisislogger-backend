import '../../envConfigurate'
import crypto from 'crypto';

const APP_KEY = process.env.APP_KEY;
const SETTINGS = {
    key : Buffer.from(APP_KEY.substring(7), 'base64'),
    sha : 'sha256',
    mode : 'AES-256-CBC'
}

/**
 * Calculate MAC.
 * Payload needs to be decoded to JSON with getJsonPayload(payload)
 * @param {Object} payload with iv & value
 * @param {String} key
 */
const  calculateMac  = (payload, key) => {
    let hashedData = hash(payload['iv'], payload['value'])
    return hashHmac(hashedData, key);
}

/**
 * Decrypts payload with master key
 * @param payload
 */
const  decrypt = (payload) => {
    let _payload = getJsonPayload(payload);
    let _iv = Buffer.from(_payload['iv'], 'base64');
    let decipher = crypto.createDecipheriv(SETTINGS.mode, SETTINGS.key, _iv);
    let decrypted = decipher.update(_payload['value'], 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return hashDeserialize(decrypted);

}

/**
 * Create payload encrypted with master key.
 * Payload contains: iv, value, mac
 * @param {String} data to be encrypted
 * @return {String} Base64 encdoded payload
 */
const  encrypt = (data) => {
    let serializedValue = hashSerialize(data);

    try{
        let _iv = crypto.randomBytes(16);

        let base64_iv = _iv.toString('base64');

        let cipher = crypto.createCipheriv(SETTINGS.mode, SETTINGS.key, _iv);

        let encrypted = cipher.update(serializedValue, 'utf8', 'base64');

        encrypted += cipher.final('base64');

        let _mac = hash(base64_iv, encrypted);

        let payloadObject = {
            'iv' : base64_iv,
            'value' : encrypted,
            'mac' : _mac
        }

        let _payload = JSON.stringify(payloadObject);
        return Buffer.from(_payload).toString('base64');
    }
    catch(e){
        throw new Error('Cannot encrypt data provided !');
    }
}

/**
 * Get JSON object from payload.
 * Payload needs to be base64 encoded and must contains iv, value, mac attributes.
 * MAC is validated
 * @param {String} payload
 * @return {Object} Data with iv, value, mac
 */
const  getJsonPayload = (payload) =>{
    if(payload === undefined || payload === ''){
        throw new Error('Payload MUST NOT be empty !');
    }

    if(typeof payload !== 'string'){
        throw new Error('Payload MUST be string !');
    }
    let _payload;
    try{
        _payload = JSON.parse(Buffer.from(payload, 'base64'));
    }
    catch(e){
        throw new Error('Payload cannot be parsed !');
    }

    if(!isValidPayload(_payload)){
        throw new Error('Payload is not valid !');
    }

    if(!isValidMac(_payload)){
        throw new Error('Mac is not valid !');
    }

    return _payload;
}

/**
 * Hash function.
 * Combines initialization vector (iv) with data to be hashed (value).
 * Uses master key to hash results
 * @param {String} iv Initialization vector
 * @param {String} value Data
 */
const  hash = (iv, value) => {
    if(iv === undefined || iv === ''){
        throw new Error('Iv is not defined !');
    }
    if(value === undefined || value === ''){
        throw new Error('Value is not defined !');
    }
    let data = String(iv) + String(value);
    return hashHmac(data, SETTINGS.key);
}

/**
 * Crypto function to hash data with given key
 * @param {String} data
 * @param {String} key
 */
const  hashHmac = (data, key) => {
    let hmac = crypto.createHmac(SETTINGS.sha, key);
    hmac.update(data);
    return hmac.digest('hex');
}

/**
 * MAC validation function.
 * Payload must be decoded to JSON
 * @param {Object} payload
 */
const isValidMac = (payload) =>{
    let bytes = crypto.randomBytes(16),
        calculatedMac = calculateMac(payload, bytes);

    let originalMac = hashHmac(payload['mac'], bytes);
    return originalMac === calculatedMac;
}

/**
 * Payload validation function.
 * Payload must be decoded to JSON
 * @param {Object} payload
 */
const isValidPayload = (payload) => {
    return (payload.hasOwnProperty('iv') && payload.hasOwnProperty('value') && payload.hasOwnProperty('mac'));
}

const hashDeserialize = (data) => {
    let str = String(data);
    return str.substring( str.lastIndexOf(':') + 1, str.lastIndexOf(';') ).replace(/"/g,'');
}

const hashSerialize = (data) => {
    if(typeof data !== 'string'){
        throw new Error('Data to be serialized must be type of string !');
    }
    let str = String(data);
    return 's:'+str.length+':"'+str+';"';
}

module.exports = {
    encrypt,
    decrypt,
    getJsonPayload,
    hash
}