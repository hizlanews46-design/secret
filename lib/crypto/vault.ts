import {argon2id} from "hash-wasm";
export type EncryptedValue={version:1;algorithm:"AES-256-GCM";iv:string;ciphertext:string;salt:string};
const enc=new TextEncoder(),dec=new TextDecoder();function b64(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes))}function bytes(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0))}
export async function deriveKey(passphrase:string,salt:string){const hex=await argon2id({password:passphrase,salt,iterations:3,memorySize:65536,parallelism:1,hashLength:32,outputType:"hex"});return crypto.subtle.importKey("raw",Uint8Array.from(hex.match(/.{2}/g)!.map(x=>parseInt(x,16))),"AES-GCM",false,["encrypt","decrypt"])}
export async function encryptValue(value:string,key:CryptoKey,salt:string):Promise<EncryptedValue>{const iv=crypto.getRandomValues(new Uint8Array(12));const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(value));return {version:1,algorithm:"AES-256-GCM",iv:b64(iv),ciphertext:b64(new Uint8Array(ciphertext)),salt}}
export async function decryptValue(payload:EncryptedValue,key:CryptoKey){const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes(payload.iv)},key,bytes(payload.ciphertext));return dec.decode(plain)}
export function randomSalt(){return b64(crypto.getRandomValues(new Uint8Array(16)))}
