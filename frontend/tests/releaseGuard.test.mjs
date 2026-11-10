import assert from 'node:assert/strict'
import test from 'node:test'
import { validateBuild, validateVersions } from '../scripts/check-release.mjs'

const version = '1.2.0'
const sha = 'a'.repeat(40)
const id = '11111111-1111-4111-8111-111111111111'

function sources() {
  return {
    app: { expo: { version } },
    pkg: { version },
    lock: { version, packages: { '': { version } } },
  }
}

function finishedBuild(overrides = {}) {
  return {
    id,
    platform: 'IOS',
    buildProfile: 'production',
    status: 'FINISHED',
    appVersion: version,
    gitCommitHash: sha,
    ...overrides,
  }
}

test('release versions must agree across app, package, lockfile and tag', () => {
  assert.equal(validateVersions(sources()), version)
  assert.equal(validateVersions(sources(), 'app-v1.2.0'), version)
  for (const tag of ['v1.2.0', 'app-v1.2.1', 'app-v1.2.0-rc.1', 'app-v01.2.0', 'app-v1.2.0\n']) {
    assert.throws(() => validateVersions(sources(), tag))
  }
})

test('release rejects missing or divergent version sources', () => {
  const cases = [
    (s) => {
      s.app.expo.version = '1.3.0'
    },
    (s) => {
      s.pkg.version = '1.2.1'
    },
    (s) => {
      s.lock.version = '1.2.1'
    },
    (s) => {
      s.lock.packages[''].version = '1.2.1'
    },
    (s) => {
      delete s.lock.packages['']
    },
    (s) => {
      s.app.expo.version = '1.2'
    },
    (s) => {
      s.app.expo.version = '1.2.0\n'
    },
  ]
  for (const change of cases) {
    const data = sources()
    change(data)
    assert.throws(() => validateVersions(data))
  }
})

test('release records only a completed iOS production build from the selected commit', () => {
  assert.equal(validateBuild([finishedBuild()], version, sha), id)
  assert.equal(validateBuild(finishedBuild(), version, sha), id)
  for (const override of [
    { status: 'ERRORED' },
    { status: 'IN_PROGRESS' },
    { platform: 'ANDROID' },
    { buildProfile: 'preview' },
    { appVersion: '1.2.1' },
    { gitCommitHash: 'b'.repeat(40) },
    { id: undefined },
    { id: id + '\nother=value' },
    { id: id + '\n' },
  ]) {
    assert.throws(() => validateBuild([finishedBuild(override)], version, sha))
  }
})

test('release rejects ambiguous, absent or malformed build results', () => {
  for (const result of [[], [finishedBuild(), finishedBuild()], null, {}, 'not a build']) {
    assert.throws(() => validateBuild(result, version, sha))
  }
  assert.throws(() => validateBuild(finishedBuild(), '1.2.0-rc.1', sha))
  assert.throws(() => validateBuild(finishedBuild(), version, 'HEAD'))
  assert.throws(() => validateBuild(finishedBuild(), version, sha + '\n'))
})
