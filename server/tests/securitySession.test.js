import test from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_COOKIE, cookieToken, csrfFor, verifyCsrf, issueSession, endSession } from '../securitySession.js';

const key = 'this-is-a-test-secret-with-enough-bytes-for-hmac';
const jwt = 'test.header.signature';

test('cookie value is parsed exactly, with limits', () => {
  assert.equal(cookieToken({headers:{cookie:'other=1; '+SESSION_COOKIE+'='+jwt+'; theme=dark'}}), jwt);
  assert.equal(cookieToken({headers:{cookie:'other=1; '+SESSION_COOKIE+'x='+jwt}}), '');
  assert.equal(cookieToken({headers:{cookie:SESSION_COOKIE+'=hello%0Aworld'}}), '');
  assert.equal(cookieToken({headers:{cookie:SESSION_COOKIE+'='+'x'.repeat(8193)}}), '');
});

test('anti-CSRF is bound to both the current session and a private server key', () => {
  const csrf = csrfFor(jwt,key);
  assert.equal(verifyCsrf(csrf,jwt,key),true);
  assert.equal(verifyCsrf(csrf,'new.token.signature',key),false);
  assert.equal(verifyCsrf(csrf,jwt,'some-other-secret'),false);
  assert.equal(verifyCsrf('bad',jwt,key),false);
});

test('session cookie is HttpOnly, SameSite Strict, and scoped to root', () => {
  const calls=[];
  const res={
    cookie:(...args)=>calls.push(['cookie',...args]),
    clearCookie:(...args)=>calls.push(['clear',...args]),
    set:(...args)=>calls.push(['set',...args])
  };
  issueSession(res,jwt,key);
  assert.equal(calls[0][1],SESSION_COOKIE);
  assert.equal(calls[0][3].httpOnly,true);
  assert.equal(calls[0][3].sameSite,'strict');
  assert.equal(calls[0][3].path,'/');
  assert.equal(calls[1][2]['X-CSRF-Token'],csrfFor(jwt,key));
  endSession(res);
  assert.equal(calls[2][1],SESSION_COOKIE);
});
