import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_SECRET || 'REPLACE_WITH_32_CHAR_SECRET_KEY!!', 'utf8').slice(0, 32)

export function encrypt(plaintext: string): { enc: string; iv: string; tag: string } {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, KEY, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    enc: enc.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  }
}

export function decrypt(enc: string, iv: string, tag: string): string {
  const decipher = createDecipheriv(ALGO, KEY, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(enc, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}
