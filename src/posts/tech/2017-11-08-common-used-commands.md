---
permalink: '/posts/2017-11-08-common-used-commands.html'
title: 'Common-used Commands'
date: 2017-11-08T10:41:01.237Z
categories: [Personal]
tags: []
---

[[toc]]

Personal common-used commands list, including windows, osx, git, etc.

<!--more-->

## Git

### Clone

**Full clone**

```
$ git clone [url]
```

**Fast clone**

```
$ git clone --depth=1 [url]
$ git fetch --unshallow
```

### Fetch

```
$ git fetch [origin] [branch]
```

### Pull

```
$ git pull [origin] [orinin-branch]:[local-branch]
```

### Push

```
$ git push [origin] [orinin-branch]:[local-branch]
```

**Force push**

```
$ git push --force origin 
```

**Tags push**

```
$ git push --tags origin 
```

### Config

**Show**

```
$ git config user.name
wxsm

$ git config --list
user.name=wxsm
user.email=wxsms@foxmail.com
```

**Set**

Repo level:

```
$ git config user.name [name]
$ git config user.email [email]
$ git config http.proxy [proxy]
$ git config https.proxy [proxy]
```

Supports socks & http proxy.

Global level:

```
$ git config --global user.name [name]
$ git config --global user.email [email]
```

**Unset**

```
$ git config --unset user.email
$ git config --global --unset user.email
```

### Remote

```
$ git remote -v
origin  https://github.com/wxsms/uiv.git (fetch)
origin  https://github.com/wxsms/uiv.git (push)

$ git remote set-url origin git@github.com:wxsms/uiv.git

$ git remote -v
origin  git@github.com:wxsms/uiv.git (fetch)
origin  git@github.com:wxsms/uiv.git (push)
```

## NVM

```
nvm ls

nvm install [version]
NVM_NODEJS_ORG_MIRROR=https://npm.taobao.org/mirrors/node/ nvm install [version]

nvm use [version]
nvm alias default [version]
```

## OSX

### Keys

Name      | Symbol    
-------   | --------
command   | ⌘
option    | ⌥
shift     | ⇧
caps lock | ⇪
control   | ⌃
return    | ↩
enter     | ⌅

### Shortcuts

Name                         | Symbol    
-------                      | --------
search                       | ⌘ + space
switch input                 | ⌃ + space
delete                       | ⌘ + delete
Lock screen                  | ⌘ + ⌃ + Q
Screen shot (full)           | ⌘ + ⇧ + 3
Screen shot (custom)         | ⌘ + ⇧ + 4
Screen shot (window)         | ⌘ + ⇧ + 4 + space
Screen shot & copy (full)    | ⌘ + ⇧ + ⌃ + 3
Screen shot & copy (custom)  | ⌘ + ⇧ + ⌃ + 4
Screen shot & copy (window)  | ⌘ + ⇧ + ⌃ + 4 + space
Hide window                  | ⌘ + H
Minimize window              | ⌘ + M
Quit                         | ⌘ + Q

### Proxy command

```
$ ALL_PROXY=socks5://127.0.0.1:9500 brew update
```

### Toggle hidden files

```
$ defaults write com.apple.finder AppleShowAllFiles YES
$ defaults write com.apple.finder AppleShowAllFiles NO
```

### Open files

```
$ open nginx.conf
$ open -a TextEdit nginx.conf
```


