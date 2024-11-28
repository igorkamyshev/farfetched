import { describe, test, expect } from 'vitest';

import { hashCode } from '../hash';

describe('hashCode', () => {
  test.each([
    ['', '0'],
    ['The quick brown fox jumps over the lazy dog', '-a2u5rh'],
    ['The quick brown fox jumps over the lazy dog.', '-sbiqpx'],
    [
      'The MD5 message-digest algorithm is a widely used cryptographic hash function producing a 128-bit (16-byte) hash value, typically expressed in text format as a 32 digit hexadecimal number. MD5 has been utilized in a wide variety of cryptographic applications, and is also commonly used to verify data integrity.',
      'eamfrc',
    ],
    ['中文', 'dure'],
    ['aécio', '1lixi9'],
    [
      '訊息摘要演算法第五版（英語：Message-Digest Algorithm 5，縮寫為MD5），是當前電腦領域用於確保資訊傳輸完整一致而廣泛使用的雜湊演算法之一',
      '-w5hlrk',
    ],
    [
      '訊息摘要演算法第五版（英語：Message-Digest Algorithm 5，縮寫為MD5），是當前電腦領域用於確保資訊傳輸完整一致而廣泛使用的雜湊演算法之一（又譯雜湊演算法、摘要演算法等），主流程式語言普遍已有MD5的實作。',
      '-bdhbwb',
    ],
    ['0123456780123456780123456780123456780123456780123456780', 'ju78hc'],
    ['01234567801234567801234567801234567801234567801234567801', '-o9s6tb'],
    [
      '0123456780123456780123456780123456780123456780123456780123456780',
      'vbp3lo',
    ],
    [
      '01234567801234567801234567801234567801234567801234567801234567801234567',
      '-qz9yo8',
    ],
    [
      '012345678012345678012345678012345678012345678012345678012345678012345678',
      'fzrsw0',
    ],
  ])('"%s" -> "%s"', (source, hash) => {
    expect(hashCode(source)).toEqual(hash);
  });
});
