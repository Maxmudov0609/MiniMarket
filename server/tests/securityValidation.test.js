import test from 'node:test';
import assert from 'node:assert/strict';
import { validRegistration, validGoogleCredential } from '../securityValidation.js';

const valid = {
  name: 'Aziza',
  email: 'aziza@example.uz',
  password: 'Strong passphrase 123!',
  role: 'buyer'
};

test('accepts a valid new buyer or seller', () => {
  assert.equal(validRegistration(valid), true);
  assert.equal(validRegistration({ ...valid, role: 'seller' }), true);
});

test('never allows arbitrary privileged roles', () => {
  assert.equal(validRegistration({ ...valid, role: 'admin' }), false);
  assert.equal(validRegistration({ ...valid, role: 'owner' }), false);
  assert.equal(validRegistration({ ...valid, role: null }), false);
});

test('rejects short, overlong, and truncated-bcrypt passwords', () => {
  assert.equal(validRegistration({ ...valid, password: 'short123' }), false);
  assert.equal(validRegistration({ ...valid, password: 'z'.repeat(73) }), false);
  assert.equal(validRegistration({ ...valid, password: '🔐'.repeat(19) }), false);
  assert.equal(validRegistration({ ...valid, password: 'A secure\0passphrase' }), false);
});

test('rejects overly long names/emails and control characters', () => {
  assert.equal(validRegistration({ ...valid, name: 'A' }), false);
  assert.equal(validRegistration({ ...valid, name: 'x'.repeat(101) }), false);
  assert.equal(validRegistration({ ...valid, name: 'Jane\nDoe' }), false);
  assert.equal(validRegistration({ ...valid, email: 'a'.repeat(250) + '@example.org' }), false);
  assert.equal(validRegistration({ ...valid, email: 'bad email@example.org' }), false);
  assert.equal(validRegistration({ ...valid, email: {} }), false);
});

test('Google credentials are nonempty, bounded JWT-like strings', () => {
  assert.equal(validGoogleCredential('header.payload.signature'), true);
  assert.equal(validGoogleCredential(''), false);
  assert.equal(validGoogleCredential('a'.repeat(8193)), false);
  assert.equal(validGoogleCredential({}), false);
  assert.equal(validGoogleCredential('a\nb'), false);
});
