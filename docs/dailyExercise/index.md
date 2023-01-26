# 每日一题

算法的学习一直在行动，从未有结果。
决定在这里重新开始，每日一题，不断磨练自己！！

## 2023.1.22 [梦开始的地方-两数之和](https://leetcode.cn/problems/two-sum/)

可使用 hash 表存储遍历过的数字和索引，与未遍历的值相对比。
相比于暴力执法，使用 hash，用小空间换时间。

```js{1,6-8}
var twoSum = function(nums, target) {
    let res = {}
    for(let i =0;i< nums.length;i++){
        const cur = nums[i]
        let hashValue = target - nums[i]
        if(res[hashValue] !== undefined){
            return [i,res[hashValue]]
        }else{
            res[cur] = i
        }
    }
};
```

## 2023.1.23 [爬楼梯（动态规划）](https://leetcode.cn/problems/climbing-stairs/)

动态规划考察，找出随 N 递增，结果的变化规律。
总结规律公式，得出算法

```js
var climbStairs = function (n) {
  if (n == 0 || n === 1) {
    return 1;
  }
  let pre = 1;
  let next = 1;
  let cur;
  for (let i = 0; i < n - 1; i++) {
    cur = pre + next;
    pre = next;
    next = cur;
  }
  return cur;
};
```

## 2023.1.24 [两数相加（初尝链表）](https://leetcode.cn/problems/add-two-numbers)

```js
var addTwoNumbers = function (l1, l2) {
  let add = 0;
  let result = new ListNode();
  let cur = result;
  while (!!l1 || !!l2) {
    const v1 = !!l1 ? l1.val : 0;
    const v2 = !!l2 ? l2.val : 0;
    const sum = v1 + v2 + add;

    cur.next = new ListNode(sum % 10);
    cur = cur.next;
    add = parseInt(sum / 10);

    if (!!l1) l1 = l1.next;
    if (!!l2) l2 = l2.next;
  }
  if (add >= 1) {
    cur.next = new ListNode(add);
  }
  return result.next;
};
```

存在优化空间，可以将常用变量 !!l1 和 !!l2 设为常用量，能优化 JS 加载

```js
...
    while(!!l1 || !!l2){
        const l1isNull = !!l1
        const l2isNull = !!l2
        const v1 = l1isNull ? l1.val : 0;
        const v2 = l2isNull ? l2.val : 0;
        const sum = v1 + v2 + add

        cur.next = new ListNode(sum % 10)
        cur = cur.next
        add = parseInt(sum / 10)

        if(l1isNull) l1 = l1.next
        if(l2isNull) l2 = l2.next
    }
...
```

总结：

- 了解链表的数据结构，掌握链表的遍历方法
- 思路需要清晰，比如双链表求和，进入下一个节点前的临界条件、每个节点需要做的事情、整体算法所需内存等；

## 2023.1.25 [搜索旋转数组(数组查找相关)](https://leetcode.cn/problems/search-rotate-array-lcci)

该题可以先简化思路二分查找，扩展一下，顺带练习一下二分查找，增加条件：

- 查找出数组从小到大排序后的 target 索引

```js
var search = function (arr, target) {
  arr = arr.sort((a, b) => a - b);
  let start = 0;
  let end = arr.length - 1;
  let mid = (end - start) >> 1;
  console.log(arr);
  while (start <= end) {
    const cur = arr[mid];
    console.log(start, end, mid);
    if (target < cur) {
      end = mid - 1;
      mid = (end + start) >> 1;
    } else if (target > cur) {
      start = mid + 1;
      mid = (end + start) >> 1;
    } else {
      console.log(mid);
      return mid;
    }
  }
  return -1;
};
```

需要了解清楚旋转数组的含义后，进行答题
该题属于局部最小值问题，需要查找边界条件

```js
/**
 * @param {number[]} arr
 * @param {number} target
 * @return {number}
 */
var search = function (arr, target) {
  if (arr[0] === target) {
    return 0;
  }
  const length = arr.length - 1;
  if (arr[length] === target) {
    return length;
  }

  let start = 0;
  let end = length;
  let mid = 0;
  while (start <= end) {
    mid = (end + start) >> 1;
    const cur = arr[mid];
    // mid值=target，此时需要加一层遍历，确定找到最左侧的target值
    if (cur === target) {
      while (mid > 0 && arr[mid - 1] === arr[mid]) {
        mid--;
      }
      return mid;
    }
    // 说明mid~end 为递增，判读target是否在中间
    else if (cur < arr[end]) {
      if (cur < target && target <= arr[end]) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    } else if (cur > arr[end]) {
      if (cur > target && target >= arr[start]) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }
    // mid值 === arr[end] ,说明r ~0 ~ mid 都相等或者mid~r相等，都可以舍去
    else {
      r--;
    }
  }
  return -1;
};
```

## 2023.1.26 [重新排列字符串](https://leetcode.cn/problems/shuffle-string/)

JS 不支持字符串根据索引修改值，因此性能会差一点

```js
/**
 * @param {string} s
 * @param {number[]} indices
 * @return {string}
 */
var restoreString = function (s, indices) {
  const result = new Array();
  for (let i = 0; i < indices.length; i++) {
    const check = indices[i];

    result[check] = s.charAt(i);
  }
  return result.join('');
};
```
