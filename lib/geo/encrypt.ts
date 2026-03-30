import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  if (!process.env.ENCRYPTION_SECRET) {
    throw new Error('ENCRYPTION_SECRET environment variable is required')
  }
  const buf = Buffer.from(process.env.ENCRYPTION_SECRET, 'utf8')
  if (buf.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be at least 32 characters')
  }
  return buf.slice(0, 32)
}

export function encrypt(plaintext: string): { enc: string; iv: string; tag: string } {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    enc: enc.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  }
}

export function decrypt(enc: string, iv: string, tag: string): string {
  const key = getKey()
  const decipher = createDecipheriv(ALGO, key, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(enc, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}
