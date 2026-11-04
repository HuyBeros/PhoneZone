import test from 'node:test';
import assert from 'node:assert/strict';
import { readWishlist, writeWishlist, wishlistStorageKey } from './wishlistStorage.js';

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}
const phone = (id = 1) => ({ id, name: `Phone ${id}`, img: '/phone.png', price: 100000, brand: 'Test' });

test('signed-out users never read or write a wishlist, including legacy shared data', () => {
  const storage = memoryStorage();
  storage.setItem('phonezone_wishlist_items', JSON.stringify([phone()]));
  assert.deepEqual(readWishlist(null, storage), []);
  assert.equal(writeWishlist(null, [phone()], storage), false);
  assert.equal(wishlistStorageKey(null), null);
});

test('account A and account B cannot see each other’s saved products', () => {
  const storage = memoryStorage();
  assert.equal(writeWishlist(1, [phone(10)], storage), true);
  assert.deepEqual(readWishlist(2, storage), []);
  assert.equal(writeWishlist(2, [phone(20)], storage), true);
  assert.equal(readWishlist(1, storage)[0].id, 10);
  assert.equal(readWishlist(2, storage)[0].id, 20);
});

test('logout hides the list and signing into the same account can restore it', () => {
  const storage = memoryStorage();
  writeWishlist(1, [phone()], storage);
  assert.deepEqual(readWishlist(null, storage), []);
  assert.equal(readWishlist('1', storage)[0].id, 1);
});

test('clearing one account preserves another account’s list', () => {
  const storage = memoryStorage();
  writeWishlist(1, [phone(10)], storage);
  writeWishlist(2, [phone(20)], storage);
  writeWishlist(1, [], storage);
  assert.deepEqual(readWishlist(1, storage), []);
  assert.equal(readWishlist(2, storage)[0].id, 20);
});

test('malformed persisted data cannot crash the wishlist', () => {
  const storage = memoryStorage();
  for (const value of ['{invalid', 'null', '{}', '[null, 1, {"id":1}]']) {
    storage.setItem(wishlistStorageKey(1), value);
    assert.deepEqual(readWishlist(1, storage), []);
  }
});

test('stored product snapshots exclude unrelated fields and duplicate IDs', () => {
  const storage = memoryStorage();
  writeWishlist(1, [{ ...phone(), unrelated: 'not a product field' }, { ...phone(), id: '1' }], storage);
  const items = readWishlist(1, storage);
  assert.equal(items.length, 1);
  assert.equal('unrelated' in items[0], false);
});

test('blocked storage reports a failure so the UI cannot announce a successful save', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); }, removeItem() { throw new Error('blocked'); } };
  assert.deepEqual(readWishlist(1, storage), []);
  assert.equal(writeWishlist(1, [phone()], storage), false);
});
