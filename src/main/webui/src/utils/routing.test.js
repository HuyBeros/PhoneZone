import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLegacyRoute } from './routing.js';

test('the old login redirect becomes a clean login route', () => {
    assert.equal(getLegacyRoute('http://localhost:8080/?login=true#/login'), '/login');
    assert.equal(getLegacyRoute('http://localhost:8080/?login=true'), '/login');
});

test('old product links still open the intended product', () => {
    assert.equal(getLegacyRoute('https://phonezone.example/#/product/51'), '/product/51');
});

test('search parameters from hash routes are preserved', () => {
    assert.equal(getLegacyRoute('http://localhost:8080/?login=true#/brand/all?q=iPhone+17'), '/brand/all?q=iPhone+17');
});

test('clean URLs and section anchors are not rewritten', () => {
    assert.equal(getLegacyRoute('http://localhost:8080/login'), null);
    assert.equal(getLegacyRoute('http://localhost:8080/#contact'), null);
    assert.equal(getLegacyRoute('http://localhost:8080/#//other.example/path'), null);
});
