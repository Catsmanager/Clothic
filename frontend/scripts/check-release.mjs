import { appendFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const commitHash = /^[a-f\d]{40}$/i
const buildId = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i

function matches(pattern, value) {
  return typeof value === 'string' && value.trim() === value && pattern.test(value)
}

export function validateVersions({ app, pkg, lock }, tag) {
  const versions = [
    ['app.json', app?.expo?.version],
    ['package.json', pkg?.version],
    ['package-lock.json', lock?.version],
    ['package-lock.json root package', lock?.packages?.['']?.version],
  ]
  const version = versions[0][1]
  for (const [name, value] of versions) {
    if (!matches(stableVersion, value)) {
      throw new Error(`${name} must contain a stable X.Y.Z version`)
    }
    if (value !== version) throw new Error(`${name} version does not match app.json`)
  }
  if (tag !== undefined && tag !== `app-v${version}`) {
    throw new Error('Release tag must exactly match app-v<app version>')
  }
  return version
}

export function validateBuild(result, version, sha) {
  if (!matches(stableVersion, version) || !matches(commitHash, sha)) {
    throw new Error('Expected a stable app version and full source commit')
  }
  const builds = Array.isArray(result) ? result : [result]
  if (builds.length !== 1 || !builds[0] || typeof builds[0] !== 'object') {
    throw new Error('Expected exactly one EAS build result')
  }
  const build = builds[0]
  if (build.platform !== 'IOS' || build.buildProfile !== 'production') {
    throw new Error('Expected an iOS production build')
  }
  if (build.status !== 'FINISHED') throw new Error('EAS build has not finished successfully')
  if (build.appVersion !== version || build.gitCommitHash !== sha) {
    throw new Error('EAS build version or source commit does not match the verified release')
  }
  if (!matches(buildId, build.id)) {
    throw new Error('EAS build ID is missing or invalid')
  }
  return build.id
}

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`)
  console.log(`${name}=${value}`)
}

function main() {
  const [command, ...args] = process.argv.slice(2)
  if (command === 'versions' && args.length <= 1) {
    const read = (file) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'))
    output(
      'version',
      validateVersions(
        { app: read('app.json'), pkg: read('package.json'), lock: read('package-lock.json') },
        args[0]
      )
    )
    return
  }
  if (command === 'build' && args.length === 3) {
    const [file, version, sha] = args
    output('build_id', validateBuild(JSON.parse(readFileSync(file, 'utf8')), version, sha))
    return
  }
  throw new Error(
    'Usage: check-release.mjs versions [app-vX.Y.Z] | build <json-file> <version> <sha>'
  )
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Release validation failed')
    process.exitCode = 1
  }
}
