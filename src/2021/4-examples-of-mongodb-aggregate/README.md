---

title: 'MongoDB Aggregate 4 例'
date: 2021-02-17T09:05:48.042Z
tags: [mongodb]
---

有数据格式如下：

```json5
{
  "id": "745",
  "knownName": {
    "en": "A. Michael Spence",
    "se": "A. Michael Spence"
  },
  "familyName": {
    // 结构同上，下同
    // ..
  },
  "orgName": {
    // orgName 当获奖者为组织时出现
    // ..
  },
  "gender": "male",
  "nobelPrizes": [
    {
      "awardYear": "2001",
      // ...
      "affiliations": [
        {
          "name": {
            "en": "Stanford University",
            // ...
          },
          "city": {
            // ...
          },
          "country": {
            // ...
          },
          // ...
        }
      ]
    }
  ]
}
```

想要实现：

1. 查找名为 `CERN` 的 `affiliation` 的所在国家
2. 查找获奖次数大于等于 5 次的 `familyName`
3. 查找 `University of California` 的不同所在位置总数
4. 查找至少一个诺贝尔奖授予组织而非个人的年份总数


<!-- more -->

## 查找名为 CERN 的 affiliation 的所在国家

需要注意的是 `affiliations` 是 `nobelPrizes` 下的数组（嵌套数组结构），因此需要分两次展开：

```javascript
db.laureates.aggregate(
  [
    // 展开 nobelPrizes
    { $unwind: '$nobelPrizes' },
    // 展开 nobelPrizes 下面的 affiliations
    { $unwind: '$nobelPrizes.affiliations' },
    // 找到名为 CERN 的记录
    { $match: { 'nobelPrizes.affiliations.name.en': 'CERN' } },
    // 将结果限制为 1 条
    { $limit: 1 },
    // 映射输出
    { $project: { '_id': 0, 'country': '$nobelPrizes.affiliations.country.en' } }
  ]
);

// output:
// { "country" : "Switzerland" }
```

## 查找获奖次数大于等于 5 次的 familyName

这里需要用到 `$group` 操作，根据 `familyName` 来进行分组，并且需要提前计算好每条记录所获奖的数量：

```javascript
db.laureates.aggregate(
  [
    // 映射每条记录的 nobelPrizes 长度为 nobelPrizesLength，familyName.en 为 familyName
    { $project: { nobelPrizesLength: { $size: "$nobelPrizes" }, familyName: "$familyName.en" } },
    // 找到 familyName 存在的记录（非组织获奖）
    { $match: { familyName: { $exists: !0, $ne: null } } },
    // 以 familyName 为依据进行分组，并累加 nobelPrizesLength 作为 count
    { $group: { _id: "$familyName", count: { $sum: "$nobelPrizesLength" }, familyName: { $first: "$familyName" } } },
    // 找到 count 大于等于 5 的记录
    { $match: { count: { $gte: 5 } } },
    // 映射输出
    { $project: { familyName: "$familyName", _id: 0 } }
  ]
);

// output:
// { "familyName" : "Smith" }
// { "familyName" : "Wilson" }
```

## 查找 University of California 的不同所在位置总数

一个相比上个查询更简单的 group 查询：

```javascript
db.laureates.aggregate(
  [
    // 展开 nobelPrizes
    { $unwind: "$nobelPrizes" },
    // 展开 nobelPrizes 下面的 affiliations
    { $unwind: "$nobelPrizes.affiliations" },
    // 找到名为 University of California 的记录
    { $match: { "nobelPrizes.affiliations.name.en": "University of California" } },
    // 以 city 名作为依据分组
    { $group: { _id: "$nobelPrizes.affiliations.city.en" } },
    // 输出分组后的总记录数
    { $count: "locations" }
  ]
);

// output:
// { "locations" : 6 }
```

## 查找至少一个诺贝尔奖授予组织而非个人的年份总数

这里注意 group 之前先把授予个人的记录筛除掉：

```javascript
db.laureates.aggregate(
  [
    // 找到 orgName 存在的记录（组织获奖）
    { $match: { orgName: { $exists: !0, $ne: null } } },
    // 展开 nobelPrizes
    { $unwind: "$nobelPrizes" },
    // 以获奖年份分组
    { $group: { _id: "$nobelPrizes.awardYear" } },
    // 输出分组后的总记录数
    { $count: "years" }
  ]
);

// output:
// { "years" : 26 }
```