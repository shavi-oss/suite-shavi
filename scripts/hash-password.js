#!/usr/bin/env node
/**
 * Hash Password Utility
 * 
 * Generates a scrypt password hash entry for OPERATOR_CREDENTIALS env var.
 * 
 * Usage:
 *   node scripts/hash-password.js <password>
 * 
 * Output:
 *   <16-byte-hex-salt>:<64-byte-hex-hash>
 * 
 * Then set in Railway:
 *   OPERATOR_CREDENTIALS={"admin@bassan.io":"<output-here>"}
 * 
 * IMPORTANT: Never commit the output or store it in source code.
 */

const { scryptSync, randomBytes } = require('crypto');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

if (password.length < 12) {
  console.error('ERROR: Password must be at least 12 characters.');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);

const entry = salt.toString('hex') + ':' + hash.toString('hex');
console.log('\nPassword hash entry (copy this value):');
console.log(entry);
console.log('\nSet in Railway:');
console.log('OPERATOR_CREDENTIALS={"your@email.io":"' + entry + '"}');
console.log('\nDo NOT commit or log this value.');
