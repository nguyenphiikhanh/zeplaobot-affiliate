import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm'

test('session persists in database and reloads without environment configuration', async () => {
  let record
  const db = {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => record ? [record] : [] }) }) }),
    insert: () => ({ values: value => ({ onDuplicateKeyUpdate: async ({ set }) => {
      assert.equal(value.key, 'zalo_login_session')
      record = { value: record ? set.value : value.value }
    } }) }),
  }
  const context = createContext({ Date })
  const source = await readFile(new URL('../dist/services/zalo-session.service.js', import.meta.url), 'utf8')
  const module = new SourceTextModule(source, { context })
  await module.link(specifier => {
    const values = specifier === 'drizzle-orm' ? { eq: () => ({}) }
      : specifier.endsWith('schema.js') ? { systemConfigs: {} } : { db }
    return new SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value)
    }, { context })
  })
  await module.evaluate()
  const { loadZaloSession, saveZaloSession } = module.namespace
  assert.equal(await loadZaloSession(), null)
  const credentials = { imei: 'device', userAgent: 'agent', cookie: [{ key: 'zpsid', value: 'cookie' }] }
  await saveZaloSession(credentials)
  assert.deepEqual(JSON.parse(record.value), credentials)
  assert.equal(JSON.stringify(await loadZaloSession()), JSON.stringify(credentials))
  const refreshed = { ...credentials, cookie: [{ key: 'zpsid', value: 'new-cookie' }] }
  await saveZaloSession(refreshed)
  assert.equal(JSON.stringify(await loadZaloSession()), JSON.stringify(refreshed))
  record = { value: '{broken-json' }
  await assert.rejects(loadZaloSession)
  record = { value: JSON.stringify({ imei: 'device' }) }
  await assert.rejects(loadZaloSession, /không hợp lệ/)
})
