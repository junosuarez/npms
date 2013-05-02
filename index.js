#! /usr/local/bin/node
var spawn = require('child_process').spawn

if (process.argv.some(function (arg) {
  return arg.toLowerCase() === '-h' || arg.toLowerCase() === '--help'
})) {
  die('npms package1 ... packageN' +
    '\n\tinstalls packages and saves to packages.json. package can be any of:\n' +
    '\n\t\tpackage             - install latest from npm' +
    '\n\t\tpackage@version     - specific version from npm' +
    '\n\t\tgithubUser/repo@tag - specific tag from private github' +
    '\n\n\tIt saves to packages.json by default, it uses github for git urls by default, and it\n\tuses git+ssh by default, because why wouldn\'t you?')
}

var packages = process.argv.slice(2).map(format)

if (!packages.length) {
  die('no packages specified; aborting installation')
}

console.log('installing: ' + packages.join(', '))
install(packages)


/////////////////////

function install(packages) {

  var command = 'npm install --save ' + packages.join(' ')
  spawn('npm', ['install','--save'].concat(packages), {stdio: 'inherit'})

}

function format(package) {
  if (/.+\/.+/.test(package)) {
    console.log('git:', package)
    package = package.split(/@|#/)
    if (!package[1]){
      die('No tag specified for ' + package + ' ( user/repo@tag )')
    }
    return 'git+ssh://git@github.com:'+package[0] + '.git#' + package[1]
  }
  return package
}


function die(m, code) {
  console.log(m)
  process.exit(code)
}