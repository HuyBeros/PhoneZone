const PREFIX = 'phonezone_wishlist_items:user:';

export function wishlistStorageKey(ownerId) {
  return ownerId === null || ownerId === undefined || ownerId === ''
    ? null : `${PREFIX}${encodeURIComponent(String(ownerId))}`;
}

function normalize(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  return items.filter(item => {
    if (!item || !['string', 'number'].includes(typeof item.id) || !String(item.id).trim()
      || typeof item.name !== 'string' || !item.name.trim() || !Number.isFinite(item.price) || item.price < 0) return false;
    const id = String(item.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).map(({ id, name, img, price, oldPrice, brand }) => ({ id, name, img, price, oldPrice, brand }));
}

export function readWishlist(ownerId, storage) {
  const key = wishlistStorageKey(ownerId);
  if (!key) return [];
  try {
    return normalize(JSON.parse((storage ?? window.localStorage).getItem(key) || '[]'));
  } catch {
    return [];
  }
}

export function writeWishlist(ownerId, items, storage) {
  const key = wishlistStorageKey(ownerId);
  if (!key) return false;
  try {
    const target = storage ?? window.localStorage;
    const safeItems = normalize(items);
    if (safeItems.length) target.setItem(key, JSON.stringify(safeItems));
    else target.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
