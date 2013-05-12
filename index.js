#! /usr/local/bin/node
var spawn = require('child_process').spawn
var ghLatest = require('github-latest')
var Q = require('q')

if (process.argv.some(function (arg) {
  return arg.toLowerCase() === '-h' || arg.toLowerCase() === '--help'
})) {
  die('npms package1 ... packageN' +
    '\n\tinstalls packages and saves to packages.json. package can be any of:\n' +
    '\n\t\tpackage             - install latest from npm' +
    '\n\t\tpackage@version     - specific version from npm' +
    '\n\t\tgithubUser/repo     - install latest from github' +
    '\n\t\tgithubUser/repo@tag - specific tag from github' +
    '\n\n\tIt saves to packages.json by default, it uses github for git urls by default, and it\n\tuses git+ssh by default, because why wouldn\'t you?')
}

var packages = process.argv.slice(2)

if (!packages.length) {
  die('no packages specified; aborting installation')
}

Q.all(packages.map(format)).then(function (packages) {

  console.log('installing: ' + packages.join(', '))
  install(packages)

})

/////////////////////

function install(packages) {

  var command = 'npm install --save ' + packages.join(' ')
  spawn('npm', ['install','--save'].concat(packages), {stdio: 'inherit'})

}

function format(package) {
  if (/.+\/.+/.test(package)) {
    package = parse(package)
    if (!package.tag){
      return Q.nfcall(ghLatest, package.user, package.repo)
        .then(function (tag) {
          return 'git+ssh://git@github.com:' + package.user + '/' + package.repo + '.git#' + tag
        })
    }
    return Q('git+ssh://git@github.com:' + package.user + '/' + package.repo + '.git#' + package.tag)
  }
  return Q(package)
}

function parse(package) {
  var parts = package.split(/@|#|\//g)
  return {
    user: parts[0],
    repo: parts[1],
    tag: parts[2]
  }
}

function die(m, code) {
  console.log(m)
  process.exit(code)
}