#! /usr/local/bin/node
var spawn = require('child_process').spawn
var ghLatest = require('github-latest')
var Q = require('q')
var resolved = require('resolved')

if (process.argv.some(function (arg) {
  return arg.toLowerCase() === '-h' || arg.toLowerCase() === '--help'
}) || process.argv.length === 2) {
  die('npms [options] package1 ... packageN' +
    '\n  installs packages and saves to packages.json. package can be any of:' +
    '\n' +
    '\n    package             - install latest from npm' +
    '\n    package@version     - specific version from npm' +
    '\n    githubUser/repo     - install latest from github' +
    '\n    githubUser/repo@tag - specific tag from github' +
    '\n' +
    '\n  options' +
    '\n    -g     global install (like `npm install --global`)' +
    '\n    -d     save as dev dependency (like `npm install --save-dev`)' +
    '\n' +
    '\n  It saves to packages.json by default, it uses github for git urls by default, and it' + 
    '\n  uses git+ssh by default, because why wouldn\'t you?')

}

var opt = process.argv.slice(2).reduce(function (opt, arg) {
  if (arg == '-g') {
    opt.command = '--global'
  }
  else if (arg == '-d') {
    opt.command = '--save-dev'
  }
  else {
    opt.packages.push(arg)
  }
  return opt
}, {packages: [], command: '--save'})

if (!opt.packages.length) {
  die('no packages specified; aborting installation')
}

opt.packages = Q.all(opt.packages.map(format))

resolved(opt).then(function (opt) {

  console.log('installing: ' + opt.packages.join(', '))
  install(opt)

})

/////////////////////

function install(opt) {

  spawn('npm', ['install',opt.command].concat(opt.packages), {stdio: 'inherit'})

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