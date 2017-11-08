---
id: 'common-used-commands'
title: 'Common-used Commands'
date: 2017-11-08T10:41:01.237Z
categories: [Personal]
tags: []
index: true
draft: false
---

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

## OSX

### Shortcuts

Lock screen <kbd>Command</kbd> + <kbd>Ctrl</kbd> + <kbd>Q</kbd>


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


