knockout-plugin-foundation
==========================

A foundation for Knockout plugins.

Right now we're just testing it out. Nothing will work here yet.

![Crazy](https://sequelsprequels.files.wordpress.com/2014/06/tumblr_lm8d8w4fzi1qak7pc.gif)



## What's it do?

Lots of gulp commands. Check out `config.yaml` for options.

| Command | Description |
| ------- | ----------- |
| changelog | Update the changelog with any [conventional commit messages](https://github.com/ajoslin/conventional-changelog/blob/master/CONVENTIONS.md)
| commit | Check in any changes with `git commit`
| compile | Convert any Javascript into a compiled versions in `dist/`
| css | Compile any corresponding css/less/sass/stylus into `dist/`
| default | Show a menu of tasks
| **init**   | Initialize the repository. *Edit `config.yaml` before running this*
| lint   | Run jslint on the source
| patch, feature, release | Bump the {release}.{feature}.{patch}, *compile*, and *commit* 
| release | Run *compile*, *css*, *tag*, pushes the version and tag, then calls 'npm publish' 
| server | Run a webserver with tests 
| tag | Tags the git HEAD with the package version
| test | Run tests with a test-runner
| watch  | On changes to the source code 1.) recompile; and 2.) trigger a live-reload

Overload tasks by editing `tasks.js`.


## Get started


### A new repository

Fork gulpfile.

### An existing repository

Add/merge 'foundation' repository.
