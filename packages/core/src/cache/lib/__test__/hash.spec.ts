import { describe, test, expect } from 'vitest';

import { sha1 } from '../hash';

// Tests is copied from https://github.com/emn178/js-sha1/blob/master/tests/test.js
describe('sha1', () => {
  test.each([
    ['', 'da39a3ee5e6b4b0d3255bfef95601890afd80709'],
    [
      'The quick brown fox jumps over the lazy dog',
      '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12',
    ],
    [
      'The quick brown fox jumps over the lazy dog.',
      '408d94384216f890ff7a0c3528e8bed1e0b01621',
    ],
    [
      'The MD5 message-digest algorithm is a widely used cryptographic hash function producing a 128-bit (16-byte) hash value, typically expressed in text format as a 32 digit hexadecimal number. MD5 has been utilized in a wide variety of cryptographic applications, and is also commonly used to verify data integrity.',
      '8690faab7755408a03875895176fac318f14a699',
    ],
    ['中文', '7be2d2d20c106eee0836c9bc2b939890a78e8fb3'],
    ['aécio', '9e4e5d978deced901d621475b03f1ded19e945bf'],
    [
      '訊息摘要演算法第五版（英語：Message-Digest Algorithm 5，縮寫為MD5），是當前電腦領域用於確保資訊傳輸完整一致而廣泛使用的雜湊演算法之一',
      'ad8aae581c915fe01c4964a5e8b322cae74ee5c5',
    ],
    [
      '訊息摘要演算法第五版（英語：Message-Digest Algorithm 5，縮寫為MD5），是當前電腦領域用於確保資訊傳輸完整一致而廣泛使用的雜湊演算法之一（又譯雜湊演算法、摘要演算法等），主流程式語言普遍已有MD5的實作。',
      '3a15ad3ce9efdd4bf982eaaaecdeda36a887a3f9',
    ],
    [
      '0123456780123456780123456780123456780123456780123456780',
      '4cdeae78e8b7285aef73e0a15eec7d5b30f3f3e3',
    ],
    [
      '01234567801234567801234567801234567801234567801234567801',
      'e657e6bb6b5d0c2bf7e929451c14a5302589a60b',
    ],
    [
      '0123456780123456780123456780123456780123456780123456780123456780',
      'e7ad97591c1a99d54d80751d341899769884c75a',
    ],
    [
      '01234567801234567801234567801234567801234567801234567801234567801234567',
      '55a13698cdc010c0d16dab2f7dc10f43a713f12f',
    ],
    [
      '012345678012345678012345678012345678012345678012345678012345678012345678',
      '006575418c27b0158e55a6d261c46f86b33a496a',
    ],
  ])('"%s" -> "%s"', (source, hash) => {
    expect(sha1(source)).toEqual(hash);
  });
});
