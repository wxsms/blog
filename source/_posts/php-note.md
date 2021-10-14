---
title: Php Note
date: 2021-10-13 22:05:10
tags: [php,mysql,note]
---

Php 个人速查笔记。

<!-- more -->

## 基础

### 字符串长度

```php
strlen($string)
```

### 数组长度

```php
count($arr)
```

### 日期

#### 获取当前时间

```php
$d1 = new DateTime();
```

#### 获取指定时间

```php
$d2 = new DateTime('2021-01-01');
```

### 正则匹配

```php
preg_match("/^[A-Za-z]+$/", $Lastname)
// boolean
```

#### 获取时间差

```php
$diff = $d2->diff($d1);
// 年份差
echo $diff->y;
```

### 循环

```php
foreach ($posts as $key=>$value) {
    // todo
}
```

### EOT

```php
<?php foreach ($csv as $i => $value) {
    $dateToDisplay = date('F d, Y', $value[0]);
    echo <<<EOT
  <div class="post-preview">
    <a href="post.php?author=$value[2]&date=$value[0]&image=$value[1]&content=$value[3]&comment=$value[4]">
      <h2 class="post-title">
        <img class="Post1" src="./files/$value[1]" alt="farm" height="380px" width="720px">
      </h2>
      <h3 class="post-subtitle">$value[5]</h3>
    </a>
    <p class="post-meta">Posted by
      <a href="about.php">$value[2]</a>
      on $dateToDisplay
    </p>
  </div>
  <hr>
EOT;
} ?>
```


### 获取请求方法

```php
$request = $_SERVER['REQUEST_METHOD'];
// POST or GET or anything else
```

### 输入过滤

#### 单条

```php
$id  = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
```

#### 一次性

```php
$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
```

### 发请求

```php
$json_url = 'https://data.winnipeg.ca/resource/tx3d-pfxq.json';
$json = file_get_contents($json_url);
$list = json_decode($json, true);
```

## JSON

### 解码

```php
$json = json_decode(file_get_contents("./member.json"), true);
$points = $json['points']
```

### 编码

```php
$json = json_encode($array);
echo $json;
```

## MySQLi

### 连接

```php
session_start();

$host = 'localhost';
$user = 'root';
$password = '';
$db = 'database';

// connect to mysql database
$conn = new mysqli($host, $user, $password, $db);
if ($conn->connect_error) {
    // connection error
    die($conn->connect_error);
}
```

### 建表

```php
$sql = "CREATE TABLE IF NOT EXISTS tablename (
ID INT AUTO_INCREMENT PRIMARY KEY,
Name varchar(100) NOT NULL,
RefID int,
FOREIGN KEY (RefID) REFERENCES Ref (ID)
)";

if ($conn->query($sql) !== TRUE) {
    die("Error creating table: " . $conn->error);
}
```

### 插入

```php
$stmt = $conn->prepare("insert into table (email, date) VALUE (?,?)");
$stmt->bind_param("ss", $_SESSION['user'], $_POST['date']);
if (!$stmt->execute()) {
  die($conn->error);
} else {
  echo "inserted, id is " . $stmt->insert_id;
}
```

### 更新

```php
$query = $conn->prepare("update User set profile = ?, photo = ? where id = ?");
$query->bind_param('ssi', $_POST['profile'], $photo, $_SESSION['user'][0]);
$query->execute();
```

### 查询 (单条)

```php
$query = $conn->prepare("SELECT * FROM user where email=? and password=?");
$query->bind_param('ss', $email, $password);
$query->execute();
$result = $query->get_result();
$user = $result->fetch_array(MYSQLI_NUM);
// user 是数组，
// 字段从 0 开始排列，没有 named key
```

### 查询 (多条)

```php
$query = $conn->prepare("SELECT * from meal where email=?");
$query->bind_param('s', $_SESSION["email"]);
$query->execute();
$result = $query->get_result()->fetch_all();

// result 是数组，每个元素也是数组。
// 字段从 0 开始排列，没有 named key
```

### 删除

```php
$query = $conn->prepare("delete from Likes where photoId = ? and userId = ?");
$query->bind_param('ii', $_GET['id'], $_SESSION['user'][0]);
$query->execute();
```

## PDO

### 连接

```php
define('DB_DSN','mysql:host=localhost;dbname=blog');
define('DB_USER','root');
define('DB_PASS','');
$db = null;
try {
  $db = new PDO(DB_DSN, DB_USER, DB_PASS);
} catch (PDOException $e) {
  print "Error: " . $e->getMessage();
  die();
}
```

### 插入

```php
$query = "INSERT INTO post (title, content) values (:title, :content)";
$statement = $db->prepare($query);
$statement->bindValue(':title', $title);
$statement->bindValue(':content', $content);
$statement->execute();
$insert_id = $db->lastInsertId();
```

### 更新

```php
$query = "UPDATE post SET title = :title, content = :content WHERE id = :id";
$statement = $db->prepare($query);
$statement->bindValue(':title', $title);
$statement->bindValue(':content', $content);
$statement->bindValue(':id', $id);
$statement->execute();
$insert_id = $db->lastInsertId();
```

### 查询

```php
$query = "SELECT * FROM post ORDER BY creation_time DESC LIMIT 5";
$statement = $db->prepare($query);
$statement->execute();
$posts= $statement->fetchAll();
```

### 删除

```php
$query = "DELETE FROM post WHERE id = :id";
$statement = $db->prepare($query);
$statement->bindValue(':id', $id, PDO::PARAM_STR);
$statement->execute();
```

## 授权

### 登录

```php
// select user from db first
session_start();
$_SESSION['user'] = $user;
header("Location: index.php");
die();
```

### 注销

```php
unset($_SESSION['user']);
session_destroy();
header('Location: login.php');
die();
```

### 检查授权

```php
if (!isset($_SESSION['user'])) {
    header("Location: login.php");
    die();
}
```

### 密码加密

```php
$hashed_password = hash('ripemd128', $psw);
```

### Basic Auth

```php
define('ADMIN_LOGIN','wally');
define('ADMIN_PASSWORD','mypass');
if (!isset($_SERVER['PHP_AUTH_USER']) || 
!isset($_SERVER['PHP_AUTH_PW']) || 
($_SERVER['PHP_AUTH_USER'] != ADMIN_LOGIN) || 
($_SERVER['PHP_AUTH_PW'] != ADMIN_PASSWORD)) {
    header('HTTP/1.1 401 Unauthorized');
    header('WWW-Authenticate: Basic realm="Our Blog"');
    exit("Access Denied: Username and password required.");
}
```

## Memcached

```php
$memcached = new Memcached();
$memcached->addServer('localhost', 11211);
$memcached->set('test', 'testcache');
var_dump($memcached->get('test'));
$memcached->set('test2', '123');
var_dump($memcached->get('test2'));
var_dump($memcached->get('test3'));
```

## 业务场景

### 为导航设置激活状态

在 page include header 之前：

```php
$page = 'home';
```

在 header：

```php
<li><a class="<?= ($page == 'home') ? "current" : ""; ?>" href="index.php">Home</a></li>
```

### 文件上传

#### 保存至文件系统

```php
// upload photo to images/photos
$photo = '';
$photoExt = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
$photo = time() . "." . $photoExt;
move_uploaded_file($_FILES['photo']['tmp_name'], "images/photos/" . $photo);

// insert photo to database
$query = $conn->prepare("insert into Photo (photo, description, type, userId) value (?,?,?,?)");
$query->bind_param('sssi', $photo, $_POST['description'], $_POST['type'], $_SESSION['user'][0]);
$query->execute();
$id = $query->insert_id;

// go homepage
header('Location: index.php');
die();
```

#### 保存至数据库

```php
$fileContent = file_get_contents($_FILES['fileContent']['tmp_name']);
$contentName = mysql_fix_string($conn, $_POST['contentName']);
$query = $conn->prepare("INSERT INTO files (contentName, fileContent, userId) values (?,?,?)");
$query->bind_param('ssi', $contentName, $fileContent, $user[0]);
$query->execute();
$query->close();
```

### MySQLi 初始化数据库

```php
$conn = new mysqli($host, $user, $password);
if ($conn->connect_error) {
    die($conn->connect_error);
}

// create database
$sql = "CREATE DATABASE if not exists $db";
if ($conn->query($sql) === TRUE) {
    echo "Database $db created.";
} else {
    echo "Error creating database: " . $conn->error;
}


// connect to database
$conn = new mysqli($host, $user, $password, $db);
if ($conn->connect_error) {
    // connection error
    die($conn->connect_error);
}

$sql = "
create table if not exists faculty
(
    id   int  not null auto_increment primary key,
    name text not null
);
";

if ($conn->query($sql) === TRUE) {
    echo "<br/> faculty table created successfully";
} else {
    echo "<br/> faculty table create error:" . $conn->error;
}
```