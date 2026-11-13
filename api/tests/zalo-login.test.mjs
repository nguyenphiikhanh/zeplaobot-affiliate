// Run after npm run build:
// node --experimental-vm-modules --test tests/zalo-login.test.mjs
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { EventEmitter } from 'node:events'
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm'

async function setup({ saved = null, loginFails = false, saveFails = false } = {}) {
  const calls = { login: 0, qr: 0, saved: [], starts: 0 }
  const credentials = { imei: 'device', userAgent: 'agent', cookie: [{ key: 'zpsid', value: 'old' }] }
  const refreshedCookies = [{ key: 'zpsid', value: 'refreshed' }]
  const listener = new EventEmitter()
  listener.start = () => { calls.starts++; listener.emit('connected') }
  const api = { listener, getOwnId: () => 'bot', getCookie: () => ({ serializeSync: () => ({ cookies: refreshedCookies }) }) }
  const values = {
    Zalo: class {
      async login(value) { calls.login++; assert.deepEqual(value, saved); if (loginFails) throw new Error('network'); return api }
      async loginQR(_, callback) { calls.qr++; callback({ type: 'login-info', data: credentials }); return api }
    },
    LoginQRCallbackEventType: { GotLoginInfo: 'login-info' },
    loadZaloSession: async () => saved,
    saveZaloSession: async value => { if (saveFails) throw new Error('database'); calls.saved.push(value) },
    registerZaloNotificationApi: () => {},
    unregisterZaloNotificationApi: () => {},
  }
  const source = await readFile(new URL('../dist/zalo.js', import.meta.url), 'utf8')
  const context = createContext({ console: { log() {}, warn() {}, error() {} }, Date, setTimeout })
  const module = new SourceTextModule(source, { context })
  await module.link(specifier => {
    const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const names = source.match(new RegExp(`import \\{([^}]+)\\} from ["']${escaped}["']`))[1]
      .split(',').map(name => name.trim())
    return new SyntheticModule(names, function () {
      for (const name of names) this.setExport(name, values[name])
    }, { context })
  })
  await module.evaluate()
  return { calls, bot: module.namespace, credentials, refreshedCookies }
}

test('startup without a session never opens QR login', async () => {
  const { calls, bot } = await setup()
  await bot.initZalo({ restoreOnly: true })
  assert.equal(calls.qr, 0)
  assert.equal(bot.getZaloStatus().qrState, 'idle')
})

test('saved session restores listener and persists refreshed cookies without QR', async () => {
  const saved = { imei: 'device', userAgent: 'agent', cookie: [] }
  const { calls, bot, refreshedCookies } = await setup({ saved })
  await bot.initZalo({ restoreOnly: true })
  assert.equal(calls.login, 1)
  assert.equal(calls.qr, 0)
  assert.equal(calls.starts, 1)
  assert.equal(bot.getZaloStatus().connected, true)
  assert.deepEqual(calls.saved[0].cookie, refreshedCookies)
  assert.ok(!JSON.stringify(bot.getZaloStatus()).includes('refreshed'))
  await bot.initZalo()
  assert.equal(calls.login, 1)
})

test('failed restore retains session and allows explicit QR recovery', async () => {
  const { calls, bot } = await setup({ saved: { imei: 'device' }, loginFails: true })
  await bot.initZalo({ restoreOnly: true })
  assert.equal(calls.qr, 0)
  assert.equal(calls.saved.length, 0)
  assert.equal(bot.getZaloStatus().qrState, 'error')
  await bot.initZalo()
  assert.equal(calls.qr, 1)
  assert.equal(calls.saved.length, 1)
  assert.equal(bot.getZaloStatus().connected, true)
})

test('QR session persistence failure remains visible after listener connects', async () => {
  const { calls, bot } = await setup({ saveFails: true })
  await bot.initZalo()
  assert.equal(calls.qr, 1)
  assert.equal(bot.getZaloStatus().connected, true)
  assert.match(bot.getZaloStatus().error, /không lưu được phiên/)
})
