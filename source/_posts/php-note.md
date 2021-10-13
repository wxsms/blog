---
title: Php Note
date: 2021-10-13 22:05:10
tags: [php,mysql]
---

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

## 其他

### 为导航设置激活状态

在 page include header 之前：

```php
$page = 'home';
```

在 header：

```php
<li><a class="<?= ($page == 'home') ? "current" : ""; ?>" href="index.php">Home</a></li>
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
