---

title: MEAN.js Menu Service Extension
date: 2016-01-05T17:34:47+00:00
categories:
  - JavaScript
tags:
  - AngularJs
  - MEAN-Stack

---



MEAN.js解决方案只提供了1级/2级菜单栏的service支持，最近项目中需要用到第3级菜单，所以需要进行一个小的功能扩展。一开始我以为可以很容易地做到无限级，真正做起来以后发现并没有那么简单，所以目前通过这个办法只能达到第3级。

<!-- more -->

## 修改Menu服务

初始的Menu Service中为使用者写了两个添加菜单项的方法：

```javascript
// Add menu item object
this.addMenuItem = function (menuId, options)
```

以及

```javascript
// Add submenu item object
this.addSubMenuItem = function (menuId, parentItemState, options)
```

第一个方法很显然就是用来添加顶级菜单了，第二个在没有看代码以前我曾经天真地以为它可以无限嵌套，然而并没有，它做的事情仅限于添加第2级菜单。所以现在我需要自己写第三个方法来完成添加第三级菜单。考虑到三级循环的效率问题，虽然一般来说菜单项不会有太多，但看起来就是非常不爽，所以我给每个Menu项都添加了一个哈希表来储存其下面所有菜单项的引用，这样多花费一点点内存就可以不用写循环嵌套了。由于使用了哈希表，对原2级菜单做了一些修改：

```javascript
// Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
        options = options || {};

        // Validate that the menu exists
        this.validateMenuExistance(menuId);

        // Search for menu item
        for (var itemIndex in this.menus[menuId].items) {
            if (this.menus[menuId].items[itemIndex].state === parentItemState) {
                // Push new submenu item
                var newSubmenuItem = {
                    title: options.title || '',
                    state: options.state || '',
                    disabled: options.disabled || false,
                    roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
                    position: options.position || 0,
                    shouldRender: shouldRender,
                    items: []
                };
                this.menus[menuId].items[itemIndex].items.push(newSubmenuItem);
                this.menus[menuId].menuHash[newSubmenuItem.state] = newSubmenuItem;

                if (options.items) {
                    for (var i in options.items) {
                        this.addSubMenuItemToSubMenu(menuId, options.state, options.items[i]);
                    }
                }
            }
        }

        // Return the menu object
        return this.menus[menuId];
    };
```

然后是新的添加3级菜单的方法：

```javascript
//For level 3 menu items
    this.addSubMenuItemToSubMenu = function (menuId, parentItemState, options) {
        options = options || {};
        this.validateMenuExistance(menuId);
        for (var itemIndex in this.menus[menuId].menuHash) {
            if (this.menus[menuId].menuHash[itemIndex].state === parentItemState) {
                // Push new submenu item
                var newSubMenuItem = {
                    title: options.title || '',
                    state: options.state || '',
                    disabled: options.disabled || false,
                    roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].menuHash[itemIndex].roles : options.roles),
                    position: options.position || 0,
                    shouldRender: shouldRender,
                    items: []
                };
                this.menus[menuId].menuHash[itemIndex].items.push(newSubMenuItem);
                this.menus[menuId].menuHash[newSubMenuItem.state] = newSubMenuItem;
            }
        }
        return this.menus[menuId];
    };
```

## 修改Header模板

原Header模板中嵌套了两层Angular循环来遍历菜单项，我们给它加一层就好了，改完以后就像这样：

```html
<nav class="collapse navbar-collapse" uib-collapse="!isCollapsed" role="navigation">
    <ul class="nav navbar-nav" ng-if="menu.shouldRender(authentication.user);">
      <li ng-repeat="item in menu.items | orderBy: 'position'" ng-if="item.shouldRender(authentication.user);"
          ng-switch="item.type"
          ng-class="{ active: $state.includes(item.state), dropdown: item.type === 'dropdown',disabled:item.disabled }"
          class="{{item.class}}" uib-dropdown="item.type === 'dropdown'">
        <a ng-switch-when="dropdown" class="dropdown-toggle" uib-dropdown-toggle role="button">{{::item.title}}&nbsp;<span
          class="caret"></span></a>
        <ul ng-switch-when="dropdown" class="dropdown-menu">
          <li ng-repeat="subitem in item.items | orderBy: 'position'" ng-if="subitem.shouldRender(authentication.user);"
              ui-sref-active="active" ng-class="{'dropdown-submenu':subitem.items.length>0,disabled:subitem.disabled}">
            <a ui-sref="{{subitem.state}}" ng-bind="subitem.title" ng-if="subitem.items.length===0"></a>
            <a href="javascript:;" ng-bind="subitem.title" ng-if="subitem.items.length>0"></a>
            <ul class="dropdown-menu" ng-if="subitem.items.length>0">
              <li ng-repeat="i in subitem.items | orderBy: 'position'" ng-if="i.shouldRender(authentication.user);"
                  ui-sref-active="active" ng-class="{disabled:i.disabled}">
                <a ui-sref="{{i.state}}" ng-bind="i.title"></a>
              </li>
            </ul>
          </li>
        </ul>
        <a ng-switch-default ui-sref="{{item.state}}" ng-bind="item.title"></a>
      </li>
    </ul>
    <ul class="nav navbar-nav navbar-right" ng-hide="authentication.user">
      <li ui-sref-active="active">
        <a ui-sref="authentication.signup">Sign Up</a>
      </li>
      <li class="divider-vertical"></li>
      <li ui-sref-active="active">
        <a ui-sref="authentication.signin">Sign In</a>
      </li>
    </ul>
    <ul class="nav navbar-nav navbar-right" ng-show="authentication.user">
      <li class="dropdown" uib-dropdown>
        <a class="dropdown-toggle user-header-dropdown-toggle" uib-dropdown-toggle role="button">
          <img ng-src="{{authentication.user.profileImageURL}}" alt="{{authentication.user.displayName}}"
               class="header-profile-image"/>
          <span ng-bind="authentication.user.displayName"></span> <b class="caret"></b>
        </a>
        <ul class="dropdown-menu" role="menu">
          <li ui-sref-active="active">
            <a ui-sref="settings.profile">Edit Profile</a>
          </li>
          <li ui-sref-active="active">
            <a ui-sref="settings.picture">Change Profile Picture</a>
          </li>
          <li ui-sref-active="active" ng-show="authentication.user.provider === 'local'">
            <a ui-sref="settings.password">Change Password</a>
          </li>
          <!--li ui-sref-active="active">
            <a ui-sref="settings.accounts">Manage Social Accounts</a>
          </li-->
          <li class="divider"></li>
          <li>
            <a href="/api/auth/signout" target="_self">Signout</a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
```

## 修改CSS

为了让菜单看起来更自然些，这里修改的是 `core.css`，添加以下内容：

```css
.dropdown-submenu {
    position: relative;
}

.dropdown-menu {
    -webkit-border-radius: 0;
    -moz-border-radius: 0;
    border-radius: 0;
}

.dropdown-submenu > .dropdown-menu {
    top: 0;
    left: 100%;
    margin-top: -6px;
    margin-left: -1px;
}

.dropdown-submenu:hover > .dropdown-menu {
    display: block;
}

.dropdown-submenu > a:after {
    display: block;
    content: " ";
    float: right;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 5px 0 5px 5px;
    border-left-color: #333;
    margin: 5px -10px 0;
}

.dropdown-submenu:hover > a:after {
    border-left-color: #333;
}

.dropdown-submenu.pull-left {
    float: none;
}

.dropdown-submenu.pull-left > .dropdown-menu {
    left: -100%;
    margin-left: 10px;
    -webkit-border-radius: 6px 0 6px 6px;
    -moz-border-radius: 6px 0 6px 6px;
    border-radius: 6px 0 6px 6px;
}
```

&nbsp;

## 使用方法

3级菜单的定义方法与2级菜单一模一样，除了直接调用 `addSubMenuItemToSubMenu`  以外，还可以通过在2级菜单内定义 `items` 来实现添加子菜单，示例如下，高亮部分则为3级菜单：

```javascript
Menus.addMenuItem('topbar', {
            title: '...',
            state: '...',
            type: 'dropdown',
            position: 0,
            roles: ['*'],
            items: [{
                title: '...',
                state: '...',
                roles: ['*']
            }, {
                title: '...',
                state: '...',
                roles: ['*'],
                items: [{
                    title: '...',
                    state: '...',
                    roles: ['*']
                }, {
                    title: '...',
                    state: '...',
                    roles: ['*']
                }]
            }]
        });
```

## 实现无限级

目前看来菜单层级的限制不是在于Service代码，而在于模板。如何在模板中让Angular做一个DFS搜索才是重点。Angular貌似没有提供类似的API，要做的话比较好的办法应该是自己写一个指令。以后有时间再来实现。
