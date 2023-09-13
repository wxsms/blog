---
title: 'CentOS7 Firewalld'
date: 2019-10-24T01:28:04.174Z
tags: [linux]
---

**FirewallD** (firewall daemon) 作为 **iptables** 服务的替代品，已经默认被安装到了 CentOS7 上面。

<!-- more -->

## 管理

### 服务启动/停止

启动服务并设置自启动：

```
sudo systemctl start firewalld
sudo systemctl enable firewalld
```

停止服务并禁用自启动：

```
sudo systemctl stop firewalld
sudo systemctl disable firewalld
```

### 检查运行状态

```
sudo firewall-cmd --state
sudo systemctl status firewalld
```

### 服务重启

有两种办法可以重启 FirewallD：


1. 重启 FirewallD 服务

```
sudo systemctl restart firewalld
```

2. 重载配置文件（不断开现有会话与连接）

```
sudo firewall-cmd --reload
```

建议使用第二种方法。

## 配置

FirewallD 使用两个配置集：「**运行时配置集**」以及「**持久配置集**」。

1. 在 FirewallD 运行时：
    1. 对运行时配置的更改**会**即时生效
    2. 对持久配置集的更改**不会**被应用到本次运行中
2. 在 FirewallD 重启（如系统重启或服务重启）或重载配置时：
    1. 运行时配置集的更改**不会**被保留
    2. 持久配置集的更改**会**作为新的运行时配置而应用
    
默认情况下，使用 `firewall-cmd` 命令对防火墙做出的更改都将作用于运行时配置集，但如果添加了 `permanent` 参数则可以将改动持久化。如果要将规则同时添加到两个配置集中，有两种方法：

1. 将规则同时添加到两个配置集中

```
sudo firewall-cmd --zone=public --add-service=http --permanent
sudo firewall-cmd --zone=public --add-service=http
```

2. 将规则添加到持久配置集中，并重载

```
sudo firewall-cmd --zone=public --add-service=http --permanent
sudo firewall-cmd --reload
```

## 区域

区域（Zone）是 FirewallD 的核心特性，其它所有特性都与 Zone 相关，Zone 可以理解为场景、位置等，我们可以给不同的 Zone 定义不同的规则集。

FirewallD 的默认配置中预定义了几个 Zone，按照可信度作升序排序依次为：`drop` -> `block` -> `public` -> `external` -> `dmz` -> `work` -> `home` -> `internal` -> `trusted`，其中 `public` 是默认值。

相关指令：

```
# list all zones
sudo firewall-cmd --get-zones

# get & set default zone
sudo firewall-cmd --get-default-zone
sudo firewall-cmd --set-default-zone=external

# interfaces
sudo firewall-cmd --zone=public --add-interface=wlp1s0
sudo firewall-cmd --zone=public --change-interface=wlp1s0

# get a list of all active zones
sudo firewall-cmd --get-active-zones

# print information about a zone
sudo firewall-cmd --info-zone public
```

## 端口

使用 `--add-port` 参数来打开一个端口以及指定它的协议，zone 如果不指定的话则为当前的默认值。例如，通过以下命令来允许 HTTP 以及 HTTPS 协议的网络流量进入：

```
sudo firewall-cmd --zone=public --permanent --add-port=80/tcp --add-port=443
sudo firewall-cmd --reload
```

通过 info 指令可以查看刚才添加的端口：

```
sudo firewall-cmd --info-zone public
```

使用 `--remove-port` 参数来阻止或关闭一个端口：

```
sudo firewall-cmd --zone=public --permanent --remove-port=80/tcp --remove-port=443/tcp
```

## 服务

使用 `--add-service` 以及 `--remove-service` 来启用、禁用服务。

```
# enable
sudo firewall-cmd --zone=public --permanent --add-service=http 
sudo firewall-cmd --reload 

# disable
sudo firewall-cmd --zone=public --permanent --remove-service=http 
sudo firewall-cmd --reload 
```

## 端口转发

```
# 启用 ip masquerade
sudo firewall-cmd --zone=public --add-masquerade

# 在同一台服务器上将 80 端口的流量转发到 8080 端口
sudo firewall-cmd --zone="public" --add-forward-port=port=80:proto=tcp:toport=8080

# 将本地的 80 端口的流量转发到 IP 地址为 ：1.2.3.4 的远程服务器上的 8080 端口
sudo firewall-cmd --zone="public" --add-forward-port=port=80:proto=tcp:toport=8080:toaddr=1.2.3.4

# 删除规则
sudo firewall-cmd --zone=public --remove-masquerade
```

