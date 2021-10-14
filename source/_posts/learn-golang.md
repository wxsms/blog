---
title: 'golang 学习笔记'
date: 2021-09-30T09:49:29.406Z
tags: [golang, note]
---

我的 golang 学习笔记。好几年前就说要学了，现在终于兑现。

<!-- more -->


## 开发环境

### 安装

[https://studygolang.com/dl](https://studygolang.com/dl)

```bash
go version
go env
```

### 国内镜像

[https://goproxy.cn/](https://goproxy.cn/)

```bash
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

### goimports

```bash
go get -v golang.org/x/tools/cmd/goimports
```

### IDE

* IDEA 安装 go 和 file watcher 插件
* 新建项目使用 goimports 模板
* filewather 增加 goimports，配置默认
* 快速生成变量快捷键：ctrl+alt+v

## 基础语法

### 变量定义

* 变量类型写在后面，名字写在前面，形似 typescript
* 类型可以推断
* 没有 `char`，只有 `rune`
* 原生支持复数类型

#### `var`

```go
var a ,b, c bool
var s1, s2 string = "hello", "world"
```

* 可放在包内或函数内
* 可以用 var() 集中定义变量
* 类型可以自动推断

#### `:=`

只能在函数内使用

### 内建变量类型

* `bool`, `string`
* `(u)int`, `(u)int8`, ... `(u)int64`, `uintptr` （指针）
* `byte`, `rune` (char)
* `float32`, `float64`, `complex64`, `complex128` （复数）

类型转换是强制的，没有隐式转换。

```go
var c int = int(math.Sqrt(float64(a*a + b*b)))
```

### 常量

#### `const`

```go
const filename = "abc.txt"
```

常量数值可以作为各种类型使用：

```go
const (
    a, b     = 3, 4
)
var c int = int(math.Sqrt(a*a + b*b))
```

#### 枚举

* 用 const 定义枚举。
* 可以是固定值，也可以用 `iota` 自增。`iota` 可以参与运算。

```go
const (
    b = 1 << (10 * iota)
    kb
    mb
    gb
    tb
    pb
)
```

### 条件

#### `if`

* `if` **不需要**括号
* 条件内可以定义变量，变量的作用域局限于 `if` 内

```go
const filename = "abc.txt"
if contents, err := ioutil.ReadFile(filename); err != nil {
    fmt.Println(err)
} else {
    fmt.Printf("%s\n", contents)
}
```

#### `switch`

* `switch` **默认 `break`**，除非加 `fallthrough`
* `switch` 可以没有表达式，条件写在 `case` 内

```go
func grade(score int) string {
    g := ""
    switch {
    case score < 0 || score > 100:
        panic(fmt.Sprintf("Wrong score: %d", score))
    case score < 60:
        g = "F"
    case score < 80:
        g = "C"
    case score < 90:
        g = "B"
    case score <= 100:
        g = "A"
    }
    return g
}
```

### 循环

#### `for`

* `for` **不需要**括号
* `for` 可以省略初始条件（相当于 `while`）、结束条件、递增表达式

```go
for n := 100 ; n > 0; n /= 2 {
    // todo
}
```

```go
for scanner.Scan() {
    fmt.Println(scanner.Text())
}
```

### 函数

* 返回值类型写在最后面（类似 typescript）
* 函数可以返回多个值（一般用法为第二个参数返回 error）
* 函数返回多个值时可以起名
* 函数可以作为参数
* 有可变参数列表
* 有匿名函数
* 没有默认参数、可选参数、函数重载等

```go
func eval(a, b int, op string) (int, error) {
    switch op {
    case "+":
        return a + b, nil
    case "-":
        return a - b, nil
    case "*":
        return a * b, nil
    case "/":
        q, _ := div(a, b)
        return q, nil
    default:
        return 0, fmt.Errorf("unsupported operation: %s", op)
    }
}

func div(a, b int) (q, r int) {
    return a / b, a % b
}

func sum(numbers ...int) int {
    s := 0
    for i := range numbers {
        s += numbers[i]
    }
    return s
}

func apply(op func(int, int) int, a, b int) int {
    p := reflect.ValueOf(op).Pointer()
    opName := runtime.FuncForPC(p).Name()
    fmt.Printf("Calling func %s with args (%d, %d)\n", opName, a, b)
    return op(a, b)
}

fmt.Println(apply(func(a int, b int) int {
    return int(math.Pow(float64(a), float64(b)))
}, 3, 4))
```

### 指针

* go 指针**不能**运算
* 相比于其它语言的基础类型值传递、复杂类型引用传递，go 语言**只能进行值传递**，引用传递要显式声明

```go
func swap(a, b *int) {
    *b, *a = *a, *b
}

swap(&a, &b)
```

![](image2.png)

![](image3.png)

## 内建容器

### Array 数组

* `[10]int` 和 `[20]int` 是**不同**的类型
* 数组传入函数中的是**值**，不是引用，值会进行拷贝
* go 语言中一般不直接使用数组，而是使用 slice 切片

#### 定义

数量写在类型前

```go
var arr1 [5]int
arr2 := [3]int{1, 2, 3}
arr3 := [...]int{2, 4, 6, 8, 10}

var grid [4][5]int
```

#### 遍历

```go
for i := 0; i < len(arr3); i++ {
    fmt.Println(arr3[i])
}

for i, v := range arr3 {
    fmt.Println(i, v)
}
```

### Slice 切片

* slice **不是**值类型，它是 array 的一个视图 (view)，对 slice 的改动会反映到 array
* `slice` 可以向后扩展，但不能向前扩展
* `s[i]` 不可以超越 `len(s)`，向后拓展可以超越 `len(s)` 但不能超越 `cap(s)`

```go
arr := [...]int{0, 1, 2, 3, 4, 5, 6, 7}

fmt.Println("arr[2:6] =", arr[2:6])
fmt.Println("arr[:6] =", arr[:6])
fmt.Println("arr[2:] =", arr[2:])
fmt.Println("arr[:] =", arr[:])

func updateSlide(s []int) {
    s[0] = 100
}
updateSlide(s1)
```

```go
fmt.Println("Extending slide")
arr[0], arr[2] = 0, 2
fmt.Println("arr =", arr)
s1 = arr[2:6]
s2 = s1[3:5]
//fmt.Println(s1[4])
fmt.Printf("s1=%v, len(s1)=%d, cap(s1)=%d\n", s1, len(s1), cap(s1))
fmt.Printf("s2=%v, len(s2)=%d, cap(s2)=%d\n", s2, len(s2), cap(s2))
```

![](7a4e9184666b4e8c88f8268dd9b1f9e5.png)

![](ddbc35f312ef43a1867d4c7c9e65ad86.png)

#### create

```go
var s []int // nil
```

这种方式创建的 slice，初始值等于 `nil`。

往里面添加元素时，`len` 和 `cap` 是动态的。

![](4ded1987bf6847b08a0ab90c8f44a4af.png)

另一种方法：

```go
// 指定初始 len
s2 := make([]int, 16) 
// 指定初始 len cap
s3 := make([]int, 10, 32) 
```

#### `append`

有内建函数：

```go
s = append(s, val)
```

添加元素时如果超越了 `cap`，系统会重新分配更大的底层数组

由于值传递的关系，必须接收 `append` 的返回值

#### `copy`

```go
copy(s2, s1)
```

#### delete

删除下标为 3 的元素：

```go
s2 = append(s2[:3], s2[4:]...)
```

#### shift/pop

```go
// shift
front := s2[0]
s2 = s2[1:]
// pop
tail := s2[len(s2)-1]
s2 = s2[:len(s2)-1]
```

### Map

#### 操作

* 创建：`make(map[string]int)`
* 获取：`m[key]`，字符不存在返回 zero value
* 判断 key 是否存在：`value, ok := m[key]`
* 删除：`delete(m, key)`
* 遍历：`for k, v := range m`，无序的
* 获取长度：`len(m)`
* map 使用哈希表，key 必须可以比较相等，除了 slice map function 以外的内建类型都可以作为 key，不包含上述字段的 struct 也可以

#### 例：寻找最长的不含有重复字符的子串

```go
func longest(s string) int {
    lastOccurred := make(map[byte]int)
    start := 0
    maxLength := 0
    for i, c := range []byte(s) {
        if last, ok := lastOccurred[c]; ok && last >= start {
            start = last + 1
        }
        if (i - start + 1) > maxLength {
            maxLength = i - start + 1
        }
        lastOccurred[c] = i
    }
    return maxLength
}
```

### String

* `for i, b := range []byte(s)` 得到的是 8 位 byte
* `for i, b := range []rune(s)` 得到的是 utf8 解码后的字符
* 获取 utf8 字符串长度：`utf8.RuneCountInString(s)`
* 字符串操作库：`strings.ToUpper` / `strings.xxx`

## 面向对象

* 仅支持封装，不支持继承和多态
* 没有 class，只有 struct

### struct

* 无需关注结构体是储存在栈还是堆上
* 知识点：`nil` 指针也**能**调用方法

#### 定义

* 值定义与成员方法的定义方式与传统方式有区别
* 成员方法定义只有使用指针接收者（引用传递）才能改变结构的内容
* 结构过大要考虑使用指针接收者（拷贝成本）
* 注意方法的一致性：最好要么都是指针接收者，要么都是值接收者

```go
type TreeNode struct {
    value       int
    left, right *TreeNode
}

// 这里是值传递
func (node TreeNode) print() {
    fmt.Println(node.value)
}

// 这里是引用传递
func (node *TreeNode) setValue(value int) {
    // 不是 node->value
    node.value = value
}

root.print()
root.setValue(1)
```

#### 创建

```go
var root TreeNode
root.left = &TreeNode{}
// 指针也可以直接“点”
root.left.right = &TreeNode{4, nil, nil}
root.right = &TreeNode{value: value}
```

```go
func createNode(value int) *TreeNode {
    return &TreeNode{value: value}
}

root.right = createNode(3)
```

#### 例子：遍历树

```go
func (node *TreeNode) travel() {
    if node == nil {
        return
    }
    // 即使 node.left 是 nil，它也能调用方法！
    node.left.travel()
    node.print()
    node.right.travel()
}
```

### 包与封装

![](9db7a35f8c634ba9a4bbee5e3fc72810.png)

#### 包

* 每个目录是一个包
* “main 包”包含可执行入口
* 为结构定义的方法必须放在同一个包内，可以是不同的文件

#### 封装

* 名字 CamelCase
* 首字母大写代表 public
* 首字母小写代表 private

```go
// node.go
package tree

import "fmt"

type Node struct {
    Value       int
    Left, Right *Node
}

func CreateNode(value int) *Node {
    return &Node{Value: value}
}

// ...
```

```go
// travalsal.go
package tree

func (node *Node) Travel() {
    // ...
}
```

```go
// main.go
package main

import (
    "fmt"
    "learngo/tree"
)

func main() {
    var root tree.Node
    // ...
}
```

#### 扩展

##### 方法一：别名（简单）

```go
package queue

type Queue []int

func (q *Queue) Push(value int) {
    *q = append(*q, value)
}

func (q *Queue) Pop() int {
    pop := (*q)[0]
    *q = (*q)[1:]
    return pop
}

func (q *Queue) IsEmpty() bool {
    return len(*q) == 0
}
```

##### 方法二：组合（常用）

与 js 的 `{node: ...node}` 类似，没有其它处理：

```go
type myTreeNode struct {
    node *tree.Node
}

func (node *myTreeNode) postOrder() {
    if node == nil || node.node == nil {
        return
    }

    left := myTreeNode{node.node.Left}
    left.postOrder()

    right := myTreeNode{node.node.Right}
    right.postOrder()

    node.node.Print()
}

myNode := myTreeNode{&root}
myNode.postOrder()
```

##### 方法三：内嵌（少写代码）

* 其实是一个语法糖，编译器自动将字段以 Node 命名了。并且：Node 的属性和方法会自动提升到顶层。
* 与继承类似，可以看作继承行为的模拟，但有本质区别。
* 可以重写方法，重写的方法称作 shallowed method，而非 override，调用原 struct 方法使用 `root.Node.xxx`，相当于 `super`

```go
type myTreeNodeEmbedded struct {
    *tree.Node
}

func (node *myTreeNodeEmbedded) postOrder() {
    // 必须！
    if node == nil || node.Node == nil {
        return
    }

    left := myTreeNodeEmbedded{node.Left}
    left.postOrder()

    right := myTreeNodeEmbedded{node.Right}
    right.postOrder()

    node.Print()
}
```

## 依赖管理

三个阶段 GOPATH/GOVENDOR/go mod

### GOPATH

![](853c6909c14145e5be8208d08b8624cb.png)

* 默认在 `~/go` (linux, unix) `%USERPROFILE%\go` (windows)
* 目录下面必须有 src 文件夹，作为所有依赖与项目的根目录（Google 将 20 亿行代码，9 百万个文件放在了一个 repo 里）
* GOPATH 可以更改
* GOPATH 内的两个项目**无法**依赖同一个库的不同版本

```go
export GOPATH=/path/to/go
export GO111MODULE=off
// in src/proj folder
go get -u go.uber.org/zap
```

### GOVENDER

> GOPATH 内的两个项目**无法**依赖同一个库的不同版本

* 为了解决这个问题诞生了 GOVENDER，只需要在 project 里面新建 vender 文件夹，依赖就会从首先 vender 文件夹内查找
* 有许多配套的依赖管理工具

![](455e27fce6654ef98338197e7891c2ca.png)

### GO MOD

go 命令统一管理，不必关心目录结构

#### 初始化

相当于 npm init

```bash
go mod init modname
```

#### 安装/升级依赖

与 GOPATH 一样：

```bash
go get -u go.uber.org/zap@1.12.0
```

#### 依赖管理 `go.mod`

相当于 `package.json`

```
module learngo

go 1.16

require (
    go.uber.org/atomic v1.9.0 // indirect
    go.uber.org/multierr v1.7.0 // indirect
    go.uber.org/zap v1.19.0 // indirect
)
```

#### 依赖锁 `go.sum`

相当于 `package-json.lock`

```
github.com/benbjohnson/clock v1.1.0/go.mod h1:J11/hYXuz8f4ySSvYwY0FKfm+ezbsZBKZxNJlLklBHA=
github.com/davecgh/go-spew v1.1.0/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
// ...
```

#### 依赖锁瘦身

（也许相当于 `npm uninstall`）

命令：

```bash
go mod tidy
```

#### 构建

注意后面是 3 个点

```bash
go build ./...
```

#### 旧项目迁移到 gomod

```bash
go mod init
go build ./...
```

## 接口

```go
type retriever interface {
    Get(string) string
}
```

### duck typing

* “长得像鸭子，那么就是鸭子”
* 描述事物的外部行为，而非内部结构
* go 属于结构化类型系统，类似 duck typing（但本质上不是）
* 同时具有 python c++ 的 duck typing 灵活性
* 又具有 java 的类型检查

### 接口的定义

* 接口由使用者定义
* 接口的实现是隐式的，只要实现了里面的内容即可

### 接口变量

* 接口变量自带指针
* 接口变量同样采用值传递
* 指针接收者实现只能以指针方式使用，值接收者都可
* 接口变量里面有实现者的类型和值。

```go
fmt.Printf("%T %v\n", r, r)
// test.Retriever {EMT}
```

接口的真实类型可以通过 switch 获取：

```go
switch v := r.(type) {
case *infra.Retriever:
    fmt.Println(v.TimeOut)
case test.Retriever:
    fmt.Println(v.Content)
}
```

也可以通过 type assertion 获取：

```go
// type assertion
if realRetriever, ok := r.(*infra.Retriever); ok {
    fmt.Println(realRetriever.UserAgent)
} else {
    fmt.Println("type incorrect")
}
```

实现者的值也可以换成实现者的指针：

```go
type Retriever struct {
    UserAgent string
    TimeOut   time.Duration
}

func (r *Retriever) Get(url string) string {
    // ...
}

type retriever interface {
    Get(string) string
}

var r retriever = &infra.Retriever{
    TimeOut:   time.Minute,
    UserAgent: "Mozilla",
}

fmt.Printf("%T %v\n", r, r)
// *infra.Retriever &{Mozilla 1m0s}
```

### 表示任意类型的接口

类似 `any`：

```go
interface{}

// for example
type Queue []interface{}
```

### 接口的强制类型转换

```go
type Queue []interface{}

func (q *Queue) Push(value interface{}) {
    *q = append(*q, value.(int))
}
```

### 接口的组合

```go
type retriever interface {
    Get(string) string
}

type poster interface {
    Post(string, map[string]string) string
}

type retrieverPoster interface {
    retriever
    poster
}
```

### 常用内置接口

#### stringer

相当于 `toString`

```go
type Retriever struct {
    Content string
}

func (r *Retriever) String() string {
    return fmt.Sprintf("Test Retriever: {Content=%s}", r.Content)
}

fmt.Printf("%T %v\n", r, r)
// *test.Retriever Test Retriever: {Content=EMT}
```

#### reader/writer

```go
func printFile(filename string) {
    file, err := os.Open(filename)
    if err != nil {
        panic(err)
    }
    printFileContent(file)
}

func printFileContent(reader io.Reader) {
    scanner := bufio.NewScanner(reader)
    for scanner.Scan() {
        fmt.Println(scanner.Text())
    }
}

printFile("./basic/abc.txt")

printFileContent(strings.NewReader(`EMT
YES!
`))
```

## 函数式编程

![](c3ab258e951d4ee2aa5a06790c70419b.png)


### 例子：累加器

```go
func adder() func(v int) int {
    sum := 0
    return func(v int) int {
        sum += v
        return sum
    }
}

func main() {
    add := adder()
    for i := 0; i < 10; i++ {
        fmt.Println(add(i))
    }
}
```

### 例子：斐波那契数列

```go
func fib() func() int {
    before, after := 0, 1
    return func() int {
        fmt.Printf("before=%d, after=%d\n", before, after)
        before, after = after, after+before
        return after
    }
}

func main() {
    f := fib()
    for i := 0; i < 10; i++ {
        f()
    }
}
```

### 例子：二叉树遍历

```go
func (node *Node) TravelFunc(f func(*Node)) {
    if node == nil {
        return
    }

    node.Left.TravelFunc(f)
    f(node)
    node.Right.TravelFunc(f)
}

func (node *Node) Count() int {
    count := 0
    node.TravelFunc(func(node *Node) {
        count++
    })
    return count
}
```

## 错误处理和资源管理

### `defer` 调用

* `defer` 调用确保在函数结束时发生
* `defer` 先进后出（栈）
* `defer` 参数在语句时计算（非结算时）

何时使用 defer：

* open/close
* lock/unlock
* print header/footer

### 错误处理

```go
file, err := os.OpenFile(filename, os.O_EXCL|os.O_CREATE, 0666)
    if err != nil {
        if e, ok := err.(*os.PathError); !ok {
            fmt.Println(err)
        } else {
            fmt.Printf("Op: %s, Path: %s, Err: %s\n", e.Op, e.Path, e.Err)
        }
    }
```

### 统一的错误处理

以 http server 为例，思路是让 controller 可以直接返回 error，而 error 在外层的包裹函数内统一处理：

```go
type handler func(w http.ResponseWriter, r *http.Request) error

func errWrapper(h handler) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        err := h(w, r)
        if err != nil {
            log.Printf("%s\n", err.Error())
            code := http.StatusInternalServerError
            switch {
            case os.IsNotExist(err):
                code = http.StatusNotFound
            }
            http.Error(w, http.StatusText(code), code)
        }
    }
}

func main() {
    http.HandleFunc("/list/", errWrapper(controller.ListFile))

    err := http.ListenAndServe(":8888", nil)
    if err != nil {
        panic(err)
    }
}
```

### panic

* 停止当前函数执行
* 一直向上返回，执行每一层的 `defer`
* 如果没有遇见 `recover`，程序退出

### recover

* 仅在 `defer` 中使用
* 获取 `panic` 的值
* 如果无法处理，可以重新 `panic`

```go
defer func() {
    e := recover()
    if err, ok := e.(error); ok {
        fmt.Println("catch error: ", err)
    } else {
        panic(errors.New("don't know what to do: " + fmt.Sprintf("%v", e)))
    }
}()

//panic(errors.New("..."))
//panic(123)
b := 0
a := 5 / b
fmt.Println(a)
//catch error:  runtime error: integer divide by zero
```

### error vs. panic

* 尽量使用 `error`。
* 意料之中的：`error`。如：文件打不开
* 意料之外的：`panic`。如：数组越界

### 自定义错误

```go
type UserError string

func (u UserError) Error() string {
    return u.Message()
}

func (u UserError) Message() string {
    return string(u)
}

func ListFile(writer http.ResponseWriter, request *http.Request) error {
    if strings.Index(request.URL.Path, prefix) < 0 {
        // 外部可以使用 type assertion 判断，并输出自定义 message
        return UserError("path muse starts with " + prefix)
    }

    // ...
}
```

### 统一的错误处理（进阶）

```go
func errWrapper(h handler) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if r := recover(); r != nil {
                if err, ok := r.(error); ok {
                    log.Printf("%s\n", err.Error())
                    http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
                } else {
                    log.Printf("%v\n", r)
                }
            }
        }()

        err := h(w, r)
        if err != nil {
            log.Printf("%s\n", err.Error())
            if userError, ok := err.(controller.UserError); ok {
                http.Error(w, userError.Message(), http.StatusBadRequest)
                return
            }

            code := http.StatusInternalServerError
            switch {
            case os.IsNotExist(err):
                code = http.StatusNotFound
            }
            http.Error(w, http.StatusText(code), code)
        }
    }
}
```

## 测试

### 单元测试

![](1ce7baff04564b6787035adb5e9d3469.png)

```
$ go test .
ok      learngo/basic/basic     0.087s
```

单元测试文件以 `_test.go` 结尾，如 `some_function_test.go`，ide 可自动识别单元测试文件

如果要引用私有方法，需要跟方法在同一个 package

命令行执行：`go test .`

```go
package main

import (
    "testing"
)

func TestTriangle(t *testing.T) {
    tests := []struct{ a, b, c int }{
        {3, 4, 5},
        {5, 12, 13},
        {8, 15, 17},
        {12, 35, 37},
        {30000, 40000, 50000},
    }
    for _, tt := range tests {
        if c := calcTriangle(tt.a, tt.b); c != tt.c {
            t.Errorf("calcTriangle(%d,%d), expected %d, got %d", tt.a, tt.b, tt.c, c)
        }
    }
}
```

### 覆盖率

![](f5c87e2b40da4e1d836c95e81bfa4854.png)

go 自带覆盖率工具

```bash
# 生成报告
go test . -coverprofile=c.out
# 查看报告
go tool cover -html=c.out
```

### 性能测试

性能测试方法需要以 `Benchmark` 开头：

```go
func BenchmarkNonRepeating(b *testing.B) {
    // 运行一秒钟，具体次数由 go 决定
    for i := 0; i < b.N; i++ {
        assert.Equal(b, 8, longest("黑化肥挥发发灰会花飞灰化肥挥发发黑会飞花"))
    }
}
```

```bash
go test -bench .
```

### pprof

![](d3cbfbf4906e4e32afdcc105e2ff827b.png)

web 报告需要安装 [https://www.graphviz.org/download/](https://www.graphviz.org/download/)

```bash
go test -bench . -cpuprofile cpu.out
go tool pprof cpu.out
# 打开基于网页的性能报告
(pprof) web
```

![](17e50758d4e84a1683bde714e4ca8e64.png)

### http 单元测试

```go
func errorPanic(w http.ResponseWriter, r *http.Request) error {
    panic(123)
}

func errorNotExist(w http.ResponseWriter, r *http.Request) error {
    return os.ErrNotExist
}

// ...

var tests = []struct {
    h       handler
    code    int
    message string
}{
    {errorNotExist, http.StatusNotFound, http.StatusText(http.StatusNotFound)},
    // ...
}
```

#### 方式一：测代码逻辑

使用 fake req\res mock 测试：

```go
func TestErrorWrapper(t *testing.T) {
    for _, test := range tests {
        h := errWrapper(test.h)
        res := httptest.NewRecorder()
        req := httptest.NewRequest(http.MethodGet, "https://google.com", nil)
        h(res, req)
        all, _ := ioutil.ReadAll(res.Body)
        assert.Equal(t, test.message, strings.TrimSpace(string(all)))
        assert.Equal(t, test.code, res.Code)
    }
}
```

#### 方式二：真实服务器测试

```go
func TestServer(t *testing.T) {
    for _, test := range tests {
        h := errWrapper(test.h)
        s := httptest.NewServer(http.HandlerFunc(h))
        res, _ := http.Get(s.URL)
        all, _ := ioutil.ReadAll(res.Body)
        assert.Equal(t, test.message, strings.TrimSpace(string(all)))
        assert.Equal(t, test.code, res.StatusCode)
    }
}
```

### 生成文档

```go
go get golang.org/x/tools/cmd/godoc
// 启动文档服务器
godoc -http :6060
```

![](0f272d0e38754f6d8d75e654464b45ef.png)

#### 编写注释

```go
// Queue is a FIFO queue
//     q := Queue{1,2,3}
type Queue []interface{}

// Push add an item into queue
func (q *Queue) Push(value interface{}) {
    *q = append(*q, value)
}

// Pop remove an item from queue
func (q *Queue) Pop() interface{} {
    pop := (*q)[0]
    *q = (*q)[1:]
    return pop
}

// IsEmpty check if queue is empty
func (q *Queue) IsEmpty() bool {
    return len(*q) == 0
}
```

#### 编写样例

样例代码也是一种单元测试，以 `Example` 开头，并且以 `Output` 表示输出。输出不正确时 test 会不通过。

（我在想，go 的约定大于配置是不是做得有点太激进了？）

```go
func ExampleQueue_Push() {
    s := Queue{1, 2}

    s.Push(3)
    fmt.Println(s.Pop())
    fmt.Println(s.Pop())
    fmt.Println(s.IsEmpty())
    fmt.Println(s.Pop())
    fmt.Println(s.IsEmpty())

    // Output:
    // 1
    // 2
    // false
    // 3
    // true
}
```

## goroutine

* go 语言使用 goroutine 来实现并发编程。
* 任何函数加入 go 关键字就能送给调度器运行
* 不需要在定义时区分是否是异步函数
* 调度器在合适的时机自动进行切换
* 开多少个线程、goroutine 分布在哪个线程上是由调度器自动决定的

![](8e295bcb68f842d9888683b2ab517fd2.png)


### 协程 Coroutine

* 轻量级“线程”
* 非抢占式多任务处理，由协程主动交出控制权
* 编译器、解释器、虚拟机层面的多任务
* 多个协程可以在一个或多个线程上运行

![](638ef979ec104bec813670c252048d28.png)


### race condition

检查数据读写冲突：

```bash
go run -race gorouting.go
```

### goroutine 可能的切换点

只是参考，不能保证切换，不能保证在其他地方不切换

* io, select
* channel
* waiting for lock
* function call
* runtime.Gosched()

## channel

> 不要通过共享内存来通信——通过通信来共享内存。

* channel 是 goroutine 之间通信的桥梁。
* channel 可以定义可收发，也可以定义仅收、仅发
* channel 收值可以用死循环，也可以用 `range`，也可以用条件。但是用死循环的话要注意：channel 关闭后依然会不断发送消息
* channel 可以关闭 `close(c)`
* channel 可以定义缓冲区，`make(chan int, 3)`
* 注意：channel 收发是**同步**的，也就是说：
* 当发消息的时候，发送方要等待消息被接受才会继续执行
* 当收消息的时候，接收方要等待消息被发送才会继续执行
* 如果在 goroutine 之间只发不收或只收不发，会出现死锁

![](c87f0addb2a64ecda21d603fbd737a74.png)


```go
func worker(id int, c chan int) {
    // 当 channel 收到值，且未关闭时
    for n := range c {
        fmt.Printf("worker %d receive %c\n", id, n)
    }
}

// 返回值为只收 channel
func createWorker(id int) chan<- int {
    c := make(chan int)
    go worker(id, c)
    return c
}

func channelDemo() {
    var cs = make([]chan<- int, 10)
    for i := 0; i < 10; i++ {
        cs[i] = createWorker(i)
    }
    for i := 0; i < 10; i++ {
        // 向 channel 发送数据
        cs[i] <- 'a' + i
    }
    for i := 0; i < 10; i++ {
        cs[i] <- 'A' + i
    }
    time.Sleep(time.Millisecond)
}
```

### 等待任务结束

#### 方式一：使用 channel

```go
type worker struct {
    id   int
    in   chan int
    done chan bool
}

func doWork(w worker) {
    for n := range w.in {
        fmt.Printf("worker %d receive %c\n", w.id, n)
        w.done <- true
    }
}

func createWorker(id int) worker {
    w := worker{
        in:   make(chan int),
        done: make(chan bool),
        id:   id,
    }
    go doWork(w)
    return w
}

func channelDemo() {
    var w = make([]worker, 10)
    for i := 0; i < 10; i++ {
        w[i] = createWorker(i)
    }
    for i, worker := range w {
        worker.in <- 'a' + i
    }
    for _, worker := range w {
        <-worker.done
    }
    for i, worker := range w {
        worker.in <- 'A' + i
    }
    for _, worker := range w {
        <-worker.done
    }
}

func main() {
    channelDemo()
}
```

#### 方式二：使用 WaitGroup

```go
type worker struct {
    id   int
    in   chan int
    done func()
}

func doWork(w worker) {
    for n := range w.in {
        fmt.Printf("worker %d receive %c\n", w.id, n)
        w.done()
    }
}

func createWorker(id int, wg *sync.WaitGroup) worker {
    w := worker{
        in:   make(chan int),
        done: wg.Done,
        id:   id,
    }
    go doWork(w)
    return w
}

func channelDemo() {
    var w = make([]worker, 10)
    wg := sync.WaitGroup{}

    for i := 0; i < 10; i++ {
        w[i] = createWorker(i, &wg)
    }
    //wg.Add(20)
    for i, worker := range w {
        wg.Add(1)
        worker.in <- 'a' + i
        //wg.Add(1) 错误！应该先 Add 再发数据
    }
    //wg.Wait()
    for i, worker := range w {
        wg.Add(1)
        worker.in <- 'A' + i
    }
    wg.Wait()
}

func main() {
    channelDemo()
}
```

### 使用 channel 进行树遍历

```go
func (node *Node) TravelFunc(f func(*Node)) {
    // 普通的回调式遍历...
}

func (node *Node) TravelWithChannel() chan *Node {
    c := make(chan *Node)
    go func() {
        defer close(c)
        node.TravelFunc(func(node *Node) {
            c <- node
        })
    }()
    return c
}

func main() {
    var root tree.Node
    // ...
    max := 0
    node := root.TravelWithChannel()
    for n := range node {
        if n.Value > max {
            max = n.Value
        }
    }
    fmt.Println("Max: ", max)
}
```

### 使用 select 进行调度

* select 的使用，可以不加锁控制任务的执行
* 定时器的使用：定时器返回的也是 channel
* 在 select 中使用 nil channel：nil channel 永远不会被 select

```go
tm := time.After(time.Second * 10)
tick := time.Tick(time.Second)
for {
    var activeChannel chan<- int
    var activeValue int
    if len(values) > 0 {
        activeChannel = w.in
        activeValue = values[0]
    }

    select {
    case <-tm:
        fmt.Println("program exit")
        return
    case n := <-c1:
        values = append(values, n)
        //fallthrough
    case n := <-c2:
        values = append(values, n)
    case activeChannel <- activeValue:
        values = values[1:]
    case <-tick:
        fmt.Println("len(values)=", len(values))
    case <-time.After(time.Millisecond * 800):
        fmt.Println("timeout")
    }

}
```

### 传统的同步机制

* WaitGroup
* Mutex
* Cond

如果不加锁，使用 `-race` 执行会发生 data race：

```go
type atomicInt struct {
    Value int
    Lock  sync.Mutex
}

func (i *atomicInt) add(v int) {
    i.Lock.Lock()
    defer i.Lock.Unlock()
    i.Value += v
}

func (i *atomicInt) getValue() int {
    i.Lock.Lock()
    defer i.Lock.Unlock()
    return i.Value
}

func main() {
    i := atomicInt{}
    i.add(1)
    go func() {
        i.add(1)
    }()
    time.Sleep(time.Millisecond)
    fmt.Println(i.getValue())
}
```

### 并发编程模式


#### 生成器

```go
func msgGen(id string) <-chan string {
    c := make(chan string)
    i := 0
    go func() {
        for {
            time.Sleep(time.Duration(rand.Intn(2000)) * time.Millisecond)
            c <- fmt.Sprintf("generator %s sended %d", id, i)
            i++
        }
    }()
    return c
}
```

#### fanIn

将多个 channel 的消息合并为一个输出以避免阻塞：

```go
func fanIn(channels ...<-chan string) <-chan string {
    c := make(chan string)
    for _, ch := range channels {
        go func(ch <-chan string) {
            for {
                c <- <-ch
            }
        }(ch)
    }
    return c
}

func main() {
    m := fanIn(
        msgGen("svc1"),
        msgGen("svc2"),
        msgGen("svc3"),
        msgGen("svc4"),
        msgGen("svc5"),
    )
    for {
        fmt.Println(<-m)
    }
}
```

#### fanIn by select

```go
func fanInBySelect(c1 <-chan string, c2 <-chan string) <-chan string {
    c := make(chan string)
    go func() {
        for {
            select {
            case n := <-c1:
                c <- n
            case n := <-c2:
                c <- n
            }
        }
    }()
    return c
}
```

### 任务的控制

#### 非阻塞等待

```go
func noneBlockingWait(c <-chan string) (string, bool) {
    select {
    case n := <-c:
        return n, true
    default:
        return "", false
    }
}
```

#### 超时机制

```go
func timeoutWait(c <-chan string, timeout time.Duration) (string, bool) {
    select {
    case n := <-c:
        return n, true
    case <-time.After(timeout):
        return "", false
    }
}
```

#### 优雅退出

当消息的内容无所谓时，channel 可以用空的 struct，体积比 boolean 更小。

```go
func msgGen(id string, done chan struct{}) <-chan string {
    c := make(chan string)
    i := 0
    go func() {
        for {
            select {
            case <-done:
                fmt.Println("cleaning...")
                time.Sleep(time.Second * 2)
                fmt.Println("clean done.")
                done <- struct{}{}
                return
            case <-time.After(time.Duration(rand.Intn(2000)) * time.Millisecond):
                c <- fmt.Sprintf("generator %s sended %d", id, i)
                i++
            }
        }
    }()
    return c
}

func main() {
    done := make(chan struct{})
    m1 := msgGen("svc1", done)
    for i := 0; i < 5; i++ {
        if msg, ok := timeoutWait(m1, 1*time.Second); ok {
            fmt.Println("msg from svc1: ", msg)
        } else {
            fmt.Println("timeout")
        }
    }
    done <- struct{}{}
    <-done
}
//msg from svc1:  generator svc1 sended 0
//timeout
//msg from svc1:  generator svc1 sended 1
//timeout
//msg from svc1:  generator svc1 sended 2
//cleaning...
//clean done.
```

## http

### 标准库

#### 简单访问

```go
resp, err := http.Get("https://www.imooc.com")
response, err := httputil.DumpResponse(resp, true)
```

#### 自定义 Header

```go
request, err := http.NewRequest(http.MethodGet, "http://www.imooc.com", nil)
request.Header.Add("User-Agent", "xxx")
client := http.Client{CheckRedirect: func(req *http.Request, via []*http.Request) error {
    fmt.Println("Redirect:", req)
    return nil
}}
resp, err2 := client.Do(request)
response, err3 := httputil.DumpResponse(resp, true)
```

#### 性能监测

导入 pprof 后，可以在 web 端查看调试界面（端口为 web 服务端口）：

[http://localhost:8888/debug/pprof/](http://localhost:8888/debug/pprof/)

```go
import (
    // ...
    _ "net/http/pprof"
)
```

![](9bebdf3479a146bcb2d405e9fbf2d1f4.png)


也可以在控制台查看 cpu 与 内存信息：

```bash
$ go tool pprof http://localhost:6060/debug/pprof/heap
$ go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30
```
