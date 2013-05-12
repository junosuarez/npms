# npms
make it easier to install git+ssh deps

## installation

    $ npm install -g npms


## usage

    $ npms package1 ... packageN

installs packages and saves to packages.json. package can be any of:

 -  `package`             - install latest from npm
 -  `package@version`     - specific version from npm
 - `githubUser/repo`      - install latest from github
 -  `githubUser/repo@tag` - specific tag from github

It saves to packages.json by default, it uses github for git urls by default, and it
uses git+ssh by default, because why wouldn't you?


## contributors

jden <jason@denizac.org>


## license

MIT. (c) 2013 Agile Diagnosis <hello@agilediagnosis.com>. See LICENSE.md