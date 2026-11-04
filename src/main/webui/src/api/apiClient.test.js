import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchApi } from './apiClient.js';

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const originalStorage = globalThis.localStorage;
let storage;
let events;
let requests;

beforeEach(() => {
    storage = new Map([['pz_token', 'stale-token'], ['pz_user', '{}']]);
    events = [];
    requests = [];
    globalThis.localStorage = {
        getItem: key => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: key => storage.delete(key),
    };
    globalThis.window = {
        location: { href: '/orders' },
        dispatchEvent: event => { events.push(event.type); return true; },
    };
    globalThis.fetch = async (url, options) => {
        requests.push({ url, options });
        return Response.json({ ok: true });
    };
});

afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    globalThis.localStorage = originalStorage;
});

for (const endpoint of ['/auth/login', '/auth/register']) {
    test(`${endpoint} does not send a stored or explicit stale bearer token`, async () => {
        await fetchApi(endpoint, {
            method: 'POST',
            headers: { authorization: 'Bearer explicit-stale-token' },
            body: JSON.stringify({ username: 'test-user', password: 'test-password' }),
        });
        const headers = new Headers(requests[0].options.headers);
        assert.equal(headers.has('Authorization'), false);
        assert.equal(headers.get('Accept'), 'application/json');
        assert.equal(requests[0].url, `/api${endpoint}`);
    });
}

test('authenticated requests still include the bearer token', async () => {
    await fetchApi('/users/me');
    assert.equal(new Headers(requests[0].options.headers).get('Authorization'), 'Bearer stale-token');
});

test('incorrect login reports the API error without expiring another session', async () => {
    globalThis.fetch = async () => Response.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 });
    await assert.rejects(fetchApi('/auth/login', { method: 'POST' }), /Sai tên đăng nhập/);
    assert.equal(storage.get('pz_token'), 'stale-token');
    assert.deepEqual(events, []);
    assert.equal(window.location.href, '/orders');
});

test('a rejected session is cleared and emits an event without a hard redirect', async () => {
    globalThis.fetch = async () => new Response(null, { status: 401 });
    await assert.rejects(fetchApi('/users/me'), error => error.status === 401 && /hết hạn/.test(error.message));
    assert.equal(storage.has('pz_token'), false);
    assert.equal(storage.has('pz_user'), false);
    assert.deepEqual(events, ['phonezone:unauthorized']);
    assert.equal(window.location.href, '/orders');
});

test('a late 401 from an old request cannot clear a newer login', async () => {
    globalThis.fetch = async () => {
        localStorage.setItem('pz_token', 'new-session-token');
        return new Response(null, { status: 401 });
    };
    await assert.rejects(fetchApi('/users/me'));
    assert.equal(storage.get('pz_token'), 'new-session-token');
    assert.deepEqual(events, []);
});

test('forbidden responses preserve the session and explain the missing permission', async () => {
    globalThis.fetch = async () => new Response(null, { status: 403 });
    await assert.rejects(fetchApi('/admin/users'), error => error.status === 403 && /quyền/.test(error.message));
    assert.equal(storage.get('pz_token'), 'stale-token');
    assert.deepEqual(events, []);
});

test('validation messages from Quarkus are shown to the user', async () => {
    globalThis.fetch = async () => Response.json({ violations: [
        { message: 'Email không hợp lệ' },
        { message: 'Họ tên không được để trống' },
    ] }, { status: 400 });
    await assert.rejects(fetchApi('/auth/register'), /Email không hợp lệ; Họ tên không được để trống/);
});

test('HTML server errors report their HTTP status without exposing HTML', async () => {
    globalThis.fetch = async () => new Response('<html>Internal server details</html>', {
        status: 500, headers: { 'Content-Type': 'text/html' },
    });
    await assert.rejects(fetchApi('/auth/register'), error =>
        error.status === 500 && /HTTP 500/.test(error.message) && !/Internal server details/.test(error.message));
});

test('an HTML SPA fallback is not mistaken for a successful API response', async () => {
    globalThis.fetch = async () => new Response('<html>PhoneZone</html>', {
        headers: { 'Content-Type': 'text/html' },
    });
    await assert.rejects(fetchApi('/auth/login'), /JSON/);
});

test('204 responses do not need a JSON body', async () => {
    globalThis.fetch = async () => new Response(null, { status: 204 });
    assert.equal(await fetchApi('/cart', { method: 'DELETE' }), null);
});

test('network failures have a useful connection error', async () => {
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    await assert.rejects(fetchApi('/auth/login'), /kết nối/);
});
