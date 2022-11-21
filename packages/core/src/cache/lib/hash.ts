// Copied from http://www.movable-type.co.uk/scripts/sha1.html

/**
 * Generates SHA-1 hash of string
 */
export function sha1(source: string): string {
  // convert string to UTF-8, as SHA only deals with byte-streams
  let msg = encodeUTF8(source);

  // constants [§4.2.1]
  const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

  // PREPROCESSING
  msg += String.fromCharCode(0x80); // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

  // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
  const l = msg.length / 4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
  const N = Math.ceil(l / 16); // number of 16-integer-blocks required to hold 'l' ints
  const M = new Array(N);

  for (let i = 0; i < N; i++) {
    M[i] = new Array(16);
    for (let j = 0; j < 16; j++) {
      // encode 4 chars per integer, big-endian encoding
      M[i][j] =
        (msg.charCodeAt(i * 64 + j * 4) << 24) |
        (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
        (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) |
        msg.charCodeAt(i * 64 + j * 4 + 3);
    } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
  }
  // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
  // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
  // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
  M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;

  // set initial hash value [§5.3.1]
  let H0 = 0x67452301;
  let H1 = 0xefcdab89;
  let H2 = 0x98badcfe;
  let H3 = 0x10325476;
  let H4 = 0xc3d2e1f0;

  // HASH COMPUTATION [§6.1.2]

  const W = new Array(80);
  let a: number, b: number, c: number, d: number, e: number;
  for (let i = 0; i < N; i++) {
    // 1 - prepare message schedule 'W'
    for (let t = 0; t < 16; t++) W[t] = M[i][t];
    for (let t = 16; t < 80; t++)
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);

    // 2 - initialise five working variables a, b, c, d, e with previous hash value
    a = H0;
    b = H1;
    c = H2;
    d = H3;
    e = H4;

    // 3 - main loop
    for (let t = 0; t < 80; t++) {
      // seq for blocks of 'f' functions and 'K' constants
      const s = Math.floor(t / 20) as 0 | 1 | 2 | 3; // it is safe to use  0 | 1 | 2 | 3 because of max value of t is 79
      const T = (ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t]) & 0xffffffff;
      e = d;
      d = c;
      c = ROTL(b, 30);
      b = a;
      a = T;
    }

    // 4 - compute the new intermediate hash value
    H0 = (H0 + a) & 0xffffffff; // note 'addition modulo 2^32'
    H1 = (H1 + b) & 0xffffffff;
    H2 = (H2 + c) & 0xffffffff;
    H3 = (H3 + d) & 0xffffffff;
    H4 = (H4 + e) & 0xffffffff;
  }

  return (
    toHexString(H0) +
    toHexString(H1) +
    toHexString(H2) +
    toHexString(H3) +
    toHexString(H4)
  );
}

//
// function 'f' [§4.1.1]
//
function f(s: 0 | 1 | 2 | 3, x: number, y: number, z: number): number {
  switch (s) {
    case 0:
      return (x & y) ^ (~x & z); // Ch()
    case 1:
      return x ^ y ^ z; // Parity()
    case 2:
      return (x & y) ^ (x & z) ^ (y & z); // Maj()
    case 3:
      return x ^ y ^ z; // Parity()
  }
}

/**
 * rotate left (circular left shift) value x by n positions [§3.2.5]
 */
function ROTL(x: number, n: number) {
  return (x << n) | (x >>> (32 - n));
}

/**
 * hexadecimal representation of a number
 */
function toHexString(n: number): string {
  let s = '';
  let v;
  for (let i = 7; i >= 0; i--) {
    v = (n >>> (i * 4)) & 0xf;
    s += v.toString(16);
  }
  return s;
}

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} unicodeString Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
function encodeUTF8(unicodeString: string): string {
  return unicodeString
    .replace(
      /[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      (c) => {
        const cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | (cc >> 6), 0x80 | (cc & 0x3f));
      }
    )
    .replace(
      /[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function (c) {
        const cc = c.charCodeAt(0);
        return String.fromCharCode(
          0xe0 | (cc >> 12),
          0x80 | ((cc >> 6) & 0x3f),
          0x80 | (cc & 0x3f)
        );
      }
    );
}
