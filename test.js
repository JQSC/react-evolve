
const test = {
    val: 1,
    next: {
        val: 2,
        next: {
            val: 3,
            next: {
                val: 4,
                next: {
                    val: 5,
                    next: {
                        val: 6,
                        next: {
                            val: 7,
                            next: {
                                val: 8,
                                next: {
                                    val: 9,
                                    next: {
                                        val: 10,
                                        next: {
                                            val: 11,
                                            next: {
                                                val: 12,
                                                next: {
                                                    val: 13,
                                                    next: null
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

var reverseList = function (head) {
    var prev = null;
    while (head) {

    }
}

//反转链表
//将遍历的节点放在首位，下次遍历的条件为当前节点的next
//调整遍历节点的next为之前的首位
var reverseList = function (head) {
    let headNode = head; //1
    //操作当前节点的写一个节点
    while (head && head.next) {
        //当前节点2
        var currentNode = head.next;
        //当前节点2的下一个节点为旧的头
        currentNode.next = headNode;
        //处理断开点将1.3连在一起
        head.next = head.next.next;
        //将2定义为头
        headNode = currentNode;

    }
    console.log('headNode', headNode)
    return headNode;
};





var reverseList2 = function (head) {
    var pre = null;
    //操作当前节点
    while (head) {
        var next = head.next
        head.next = pre
        pre = head
        head = next
    }
    return pre
}

var test2 = {
    val: 1,
    next: {
        val: 2,
        next: {
            val: 3,
            next: {
                val: 4,
                next: {
                    val: 5,
                    next: null
                }
            }
        }
    }
}

//缓存法
function cacheData(head, m, n) {
    var arr = []
    //不改变引用的原地址，保证指针正常
    function replaceAndRemoveNext(a, b) {
        for (var key in b) {
            if (key != 'next') {
                a[key] = b[key]
            }
        }
    }
    //取出需要改变的子项，交换子项之间的除去指针next的属性
    function fn(isGet) {
        var index = 1;
        var current = head
        var i = 0
        while (current) {
            if (index >= m && index <= n) {
                if (isGet) {
                    replaceAndRemoveNext(current, arr[i++]);
                } else {
                    arr.unshift({ ...current });
                }
            }
            if (index > n) break;
            index++
            current = current.next
        }
    }

    fn(false);
    fn(true)
}

//迭代法
// 1 ,2 ,3 ,4 ,5
// 1, 3 ,2, 4, 5
// 1, 4 ,3, 2, 5
function iteration(head, m, n) {

    var dummy = { next: head }
    var pre = dummy, headNode

    for (var i = 1; i < m; i++) {
        pre = pre.next;
    }
    headNode = pre.next
    var i = 0
    while (true) {
        if ((m - 1) < i && i < n) {
            var next = headNode.next
            headNode.next = next.next   //   2.next = 4 
            next.next = pre.next        //
            pre.next = next
        }
        if (i > n) break
        i++
    }
    console.log('head', dummy.next)
    return pre
}

//迭代法2
//反转m -n 结点 在拼接



//iteration(test2, 1, 5)

var l1 = {
    val: 1,
    next: {
        val: 4,
        next: {
            val: 5,
            next: null
        }
    }
}
var l2 = {
    val: 1,
    next: {
        val: 3,
        next: {
            val: 4,
            next: null
        }
    }
}
var l3 = {
    val: 2,
    next: {
        val: 6,
        next: null
    }
}
var addTwoNumbers = function (l1, l2) {
    var liSum = '', li2Sum = '';
    var head = l1, head2 = l2;

    while (head || head2) {
        if (head) {
            liSum = head.val + liSum;
            head = head.next;
        }
        if (head2) {
            li2Sum = head2.val + li2Sum;
            head2 = head2.next;
        }
    }
    console.log('liSum', liSum, li2Sum)


    var sum = parseInt(liSum) + parseInt(li2Sum);
    console.log('sum', sum)
    var arr = sum.toString().split('');

    var pre = null;
    // 807
    for (var i = 0; i < arr.length; i++) {
        var val = arr[i];
        var obj = { val, next: null };
        if (pre) {
            obj.next = pre
        }
        pre = obj
    }
    console.log('list', pre)
    return pre
};

var addTwoNumbers2 = function (l1, l2) {

    var dummy = { next: null };
    var head = dummy
    var carry = 0;
    while (l1 || l2 || carry) {
        var l1Val = l1 ? l1.val : 0;
        var l2Val = l2 ? l2.val : 0;

        var sum = l1Val + l2Val + carry;

        if (sum >= 10) {
            carry = 1
            sum = sum - 10
        } else {
            carry = 0
        }

        head.next = { val: sum, next: null };

        head = head.next
        l1 = l1 && l1.next;
        l2 = l2 && l2.next;
    }

    console.log('dummy.next', dummy.next)
    return dummy.next
}


//addTwoNumbers2(l1, l2)
// 1,2,3
var removeNthFromEnd = function (head, n) {
    var dummy = { next: head }
    var pre = dummy
    var fast = pre.next, slow = pre.next;
    //倒数n个结点，则快慢节点距离n-1
    //快指针先走n-1步
    for (var i = 0; i < n - 1; i++) {
        fast = fast.next
    }
    while (slow) {
        //当快指针next为null 说明快指针走到了终点，此时对应的慢指针为需要删除的节点
        //此时慢指针为需要删除的节点
        if (!fast.next) {
            pre.next = slow.next
            break
        }
        pre = slow
        slow = slow.next
        fast = fast.next
    }
    console.log('dummy.next', dummy.next)
    return dummy.next
};
//删除链表的倒数第N个结点
//快慢指针
//1,2  2
// 1,2,3,4,5
var removeNthFromEnd2 = function (head, n) {
    var dummy = { next: head }
    var fast = dummy, slow = dummy;
    //先让快指针走n步，快指针不会为null
    for (var i = 0; i < n; i++) {
        fast = fast.next
    }
    //快慢指针一起走 ，直到快指针到末尾
    while (fast && fast.next) {
        slow = slow.next
        fast = fast.next
    }
    //因为快指针不会为null,且节点数量肯定大于2 ，所以不会出现slow.next为null的情况
    slow.next = slow.next.next;
    return dummy.next
};

//removeNthFromEnd2(test2, 1)

var mergeTwoLists = function (l1, l2) {
    var dummy = { next: null };
    var headNode = dummy
    while (l1 && l2) {
        if (l1.val < l2.val) {
            headNode.next = l1
            l1 = l1.next
        } else {
            headNode.next = l2
            l2 = l2.next
        }
        headNode = headNode.next
    }
    headNode.next = l1 == null ? l2 : l1
    console.log('headNode', dummy.next)
    return dummy.next
};
//mergeTwoLists(l1, l2)

//每次遍历取最小的那个数
var mergeKLists = function (...args) {
    var dummy = { next: null };
    var headNode = dummy
    var nulls = 0
    //反复遍历寻找最小数
    while (nulls < args.length - 1) {
        nulls = 0;
        var minNo = null;
        for (let i = 0; i < args.length; i++) {
            if (args[i] === null) {
                nulls++
            } else if (minNo === null || args[i].val < args[minNo].val) {
                minNo = i
            }
        }
        headNode.next = args[minNo]
        args[minNo] = args[minNo].next
        headNode = headNode.next
    }

    //拼接剩下的一个部位null的节点
    for (let i = 0; i < args.length; i++) {
        if (args[i] !== null) {
            headNode.next = args[i]
        }
    }

    console.log('dummy.next', dummy.next)
    return dummy.next
}

//分治法 +递归
var mergeKLists2 = function (...args) {
    var l = args.length;
    if (l === 0) {
        return null
    }
    if (l === 1) {
        return args[0]
    }
    if (l === 2) {
        return mergeTwoLists(args[0], args[1])
    }

    //不断切分
    var l1 = [], l2 = [];
    var mid = parseInt(l / 2);
    for (var i = 0; i < mid; i++) {
        l1.push(args[i])
    }
    for (var i = mid; i < l; i++) {
        l2.push(args[i])
    }
    return mergeTwoLists(mergeKLists2(...l1), mergeKLists2(...l2))

}

var mergeKLists3 = function (...args) {
    if (args.length === 0) {
        return null;
    }
    while (args.length > 1) {
        let a = args.shift(); // the head will contains the "less" length list
        let b = args.shift(); // acturally, we can use the linkedlist to replace it, the while loop will be the while( list.header.next !== null || lists.length > 0)
        const h = mergeTwoLists(a, b);
        args.push(h);
    }
    return args[0];
}

var test5 = {
    val: 1,
    next: {
        val: 2,
        next: {
            val: 3,
            next: {
                val: 4,
                next: {
                    val: 5,
                    next: null
                }
            }
        }
    }
}
//两两交换链表中的节点
var swapPairs = function (head) {

    var dummy = { next: head }
    var pre = dummy
    while (head && head.next) {
        //交换当前节点和下一个节点
        var firstNode = head
        var secondNode = head.next

        firstNode.next = secondNode.next
        secondNode.next = firstNode

        pre.next = secondNode
        pre = firstNode

        head = firstNode.next
    }

    console.log('dummy', dummy.next)

    return dummy.next
};

//递归版本
var swapPairs = function (head) {
    //1.递归终止条件
    if (head === null || head.next === null) {
        return head
    }
    //3、本级递归应该做什么  交换两个的值
    var next = head.next;
    head.next = swapPairs(next.next)
    next.next = head
    //2.返回值，返回交换以后的链表
    return next
}

//swapPairs(test5)

//递归版 K和一组翻转链表
var reverseKGroup = function (head, k) {
    //终止条件 当前K节点以后为null退出
    var i = 0
    var dummy = head
    while (dummy) {
        i++
        dummy = dummy.next
        if (i === k) break
    }

    if (i < k) {
        return head
    }
    //本级递归应该做什么 翻转k个节点 用反转链表II的逻辑
    var dummy = { next: head };
    var pre = dummy;
    var headNode = pre.next;
    for (var i = 1; i < k; i++) {
        var next = headNode.next;
        headNode.next = next.next;
        next.next = pre.next;
        pre.next = next
    }
    //重复执行的逻辑
    headNode.next = reverseKGroup(headNode.next, k)

    //返回值 翻转以后的值
    return dummy.next
};
//reverseKGroup(test5, 3)


var test3 = {
    val: 0,
    next: {
        val: 1,
        next: {
            val: 2,
            next: null
        }
    }
}
//旋转链表
//旋转一周为链表的长度，所以当旋转次数大于链表长度的时候 先去掉其中重复的圈数
//反方向数旋转次数，则临界点的两段链表需要互换位置
var rotateRight = function (head, k) {

    if (!head || head.next === null) return head;
    var dummy = { next: head };

    var headNode = dummy.next;

    //得到链表长度
    var i = 1;
    while (true) {
        if (headNode.next === null) break;

        headNode = headNode.next
        i++
    }

    //需要处理的节点数量
    var num = k % i;
    if (num === 0) return dummy.next;
    //已知长度 - num 则 等于链表的分割点
    i = i - num

    //从分割点得到分割的节点
    var pre = dummy;
    while (i > 0) {
        pre = pre.next
        i--
    }

    // 重置最后一个节点的指向
    headNode.next = dummy.next
    //交换两段分割的节点
    dummy.next = pre.next
    pre.next = null

    console.log('dummy.next', dummy.next)
    return dummy.next
};

//rotateRight(test5, 2)

var node = {
    val: 1,
    random: test6,
    next: null
}
var test6 = {
    val: 2,
    random: node,
    next: node
}
//删除链表中的重复元素
var deleteDuplicates = function (head) {

    if (!head || head.next === null) return head;

    var map = {}
    var dummy = { next: head }
    var headNode = dummy.next;
    var pre = headNode
    //遍历每个节点 将重复的点移除
    while (headNode) {
        if (map[headNode.val]) {
            pre.next = headNode.next
        } else {
            map[headNode.val] = true
            pre = headNode
        }
        headNode = headNode.next
    }
    console.log('dummy.next', dummy.next)
    return dummy.next
};

//给定一个排序链表，删除所有含有重复数字的节点，只保留原始链表中 没有重读出现的数字
//递归解法
var deleteDuplicates2 = function (head) {

    //1. 终止条件
    if (head === null || head.next === null) {
        return head;
    }
    //3.循环逻辑 直到出现不相等为止
    //head 后面有值而且和 head的值相等，那么就找到不相等为止，然后对后面一个结点去递归，这样就把前面重复的给删除了。
    //head 后面有值但和 head 的值不等，那么就递归后面一个结点，接在 head 的后面
    if (head.val === head.next.val) {
        while (head.next && head.val === head.next.val) {
            head = head.next
        }
        head = deleteDuplicates2(head.next)
    } else {
        head.next = deleteDuplicates2(head.next)
    }
    console.log('head', head)
    //2.返回
    return head
};

//给定一个链表和一个特定值x 对链表践行分隔 使得所有小于X的节点都在大于或者等于x的节点之前
var partition = function (head, x) {
    if (head === null || head.next === null) {
        return head;
    }

    var dummy = { next: head }
    var pre = dummy
    //找到插入点
    while (head && head.next) {
        if (head.val < x && head.next.val >= x) {
            pre = head
            head = head.next
            break;
        }
        head = head.next
    }
    if (head.next === null) {
        console.log('dummy', dummy.next)
        return dummy.next
    }
    var q = pre.next;
    while (q && q.next) {
        var current = q;
        var next = q.next;
        if (next.val < x) {
            //3-5相连
            q.next = next.next
            next.next = pre.next;

            pre.next = next
            pre = next
        } else {
            q = q.next
        }
    }


    return dummy.next
};


var partition2 = function (head, x) {
    var minList = { next: null };
    var maxList = { next: null };

    var current = minList;
    var current2 = maxList;

    while (head) {
        if (head.val < x) {
            current.next = head
            current = head
        } else {
            current2.next = head
            current2 = head
        }
        head = head.next
    }

    current2.next = null
    current.next = maxList.next

    console.log('minList', minList.next)
    return minList.next
}
//partition2(test6, 2)

//判断是否有环
var hasCycle = function (head) {
    var map = {}
    while (head && head.next) {
        if (map[head.val]) {
            return true
        }
        head = head.next
    }
    return false
};


var copyRandomList = function (head) {
    if (!head || !head.next) {
        return head;
    }
    var n = head;
    var map = new Map();
    while (n) {
        map.set(n, { val: n.val });
        n = n.next
    }
    n = head;
    while (n) {
        var c = map.get(n)
        c.next = n.next && map.get(n.next) || null;
        c.random = n.random && map.get(n.random) || null;
        n = n.next
    }
    console.log('head', map.get(head))
    return map.get(head)
};

var copyRandomList2 = function (head) {
    if (!head) {
        return null;
    }
    const clones = new Map();
    let n = head;
    while (n) {
        clones.set(n, { val: n.val });
        n = n.next
    }
    n = head;
    while (n) {
        clones.get(n).next = clones.get(n.next) || null;
        clones.get(n).random = clones.get(n.random) || null;
        n = n.next
    }
    var result = clones.get(head);
    console.log('result', result)
    return result;
};
//copyRandomList2(test6)

var findRepeatNumber = function (nums) {
    let map = new Map();
    for (let i = 0; i < nums.length; i++) {
        if (map.has(nums[i])) {
            return nums[i]
        } else {
            map.set(nums[i], i)
        }
    }
};

//寻找多维数组中要查找的数
// 二分法解题
var findNumberIn2DArray = function (matrix, target) {
    if (!matrix.length) return false;

    var rowMax = matrix.length, colMax = matrix[0].length;
    var row = 0, col = colMax - 1;
    while (row < rowMax && col >= 0) {
        var v = matrix[row][col];
        if (v > target) {
            col--
        } else if (v < target) {
            row++
        } else {
            return true
        }
    }
    return false
};

//有序数列 使用二分法解题
var missingNumber = function (nums) {
    var left = 0, right = nums.length - 1;

    while (left <= right) {
        var mid = parseInt((left + right) / 2);
        if (nums[mid] === mid) {
            //说明左边序列正常排序，右分
            left = mid + 1
        } else {
            //左边存在这个数字，左分
            right = mid - 1
        }
    }
    return left
};

var search = function (nums, target) {
    var left = 0, right = nums.length - 1;

    while (left <= right) {
        var mid = parseInt((left + right) / 2);
        if (nums[mid] > target) {
            right = mid - 1
        } else if (nums[mid] < target) {
            left = mid + 1
        } else {
            //mid 前后
            var i = mid + 1, n = 1
            while (true) {
                if (nums[i] === nums[mid]) {
                    n++
                    i++
                } else {
                    break
                }
            }
            i = mid - 1
            while (true) {
                if (nums[i] === nums[mid]) {
                    n++
                    i--
                } else {
                    break
                }
            }
            return n
        }
    }

    return 0
};


var merge = function (intervals) {
    if (!intervals.length) return []
    //对二维数组按照前序值排序
    intervals.sort((a, b) => a[0] - b[0])
    var ans = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
        var cur = intervals[i];
        var pre = ans[ans.length - 1];
        /*
        几种情况分析
         [0,i]  [j,k]
         1. i < j 保留两个区间
         2. i >= j 需要判断 i 与 k的 值 
            i> k 合并区间 以i为闭合节点 不做操作
            i <=k 合并区间 以k为闭合节点
        */
        if (pre[1] < cur[0]) {
            ans.push(cur)
        } else if (pre[1] <= cur[1]) {
            pre[1] = cur[1]
        }
    }
    console.log('ans', ans)
    return ans
};


var rotate = function (matrix) {

    for (let i = 0; i < matrix.length; i++) {
        for (let k = 0; k < matrix.length; k++) {
            matrix[i][k] = matrix[k][i]
            matrix[i].reverse();
        }
    }
    console.log('matrix', matrix)
    return matrix
};

// var a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
// rotate(a)

//14. 最长公共前缀
var longestCommonPrefix = function (strs) {
    var ret = ""
    //所有字符串与第一个字符串对比
    var firstStr = strs[0];
    for (var i = 0; i < strs.length; i++) {
        var s = "";
        //遍历 找到两个字符串的公共前缀
        for (var k = 0; k < firstStr.length; k++) {
            if (strs[i][k] === firstStr[k]) {
                s += firstStr[k]
            } else {
                break
            }
        }
        //公共前缀为空则返回
        if (!s) return ""
        //不为空 比对两次前缀的长度 保留最短
        if (!ret || s.length < ret.length) {
            ret = s
        }
    }
    return ret
};

//用双指针反转字符串
var reverseString = function (s) {
    var i = 0
    var j = s.length - 1
    while (j > i) {
        var v = s[i]
        var e = s[j];
        s[i] = e;
        s[j] = v
        i++
        j--
    }
    return s
};

//  [1,3,5,6,7,8,11]    15
var twoSum = function (numbers, target) {
    //二分法
    for (var i = 0; i < numbers.length; ++i) {
        var left = i + 1;
        var right = numbers.length - 1;
        //固定一个值 与中间值相加是否等于目标值， 如果大于目标值 则中间值左移,否则右移
        while (left <= right) {
            var mid = parseInt((left + right) / 2);
            if ((numbers[i] + numbers[mid]) == target) {
                return [i + 1, mid + 1]
            } else if ((numbers[i] + numbers[mid]) < target) {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
    }
    return [-1, -1]
};

//s = 7, nums = [2,3,1,2,4,3]
//输出：2
var minSubArrayLen = function (s, nums) {



};


//[3,1]  1

var search = function (nums, target) {
    var n = nums.length;
    if (!n) {
        return -1;
    }
    if (n == 1) {
        return nums[0] == target ? 0 : -1;
    }

    var l = 0, r = n - 1
    while (l <= r) {
        var mid = parseInt((l + r) / 2);
        if (nums[mid] == target) return mid;
        //有序
        if (nums[0] <= nums[mid]) {
            if (nums[0] <= target && target < nums[mid]) {
                r = mid - 1
            } else {
                l = mid + 1
            }
        } else {
            //无序
            if (nums[mid] < target && target <= nums[n - 1]) {
                l = mid + 1

            } else {
                r = mid - 1
            }
        }
    }

    return -1
};

//输入: nums = [5,7,7,8,8,10], target = 8
//输出: [3,4]
//查找左临界点
var searchRange = function (nums, target) {

    var l = 0, r = nums.length - 1, mid

    while (l <= r) {
        mid = parseInt((l + r) / 2);
        if (nums[mid] === target) {
            //有可能是第一个或者不是
            r = mid - 1
        } else if (nums[mid] < target) {
            l = mid + 1
        } else {
            r = mid - 1
        }
    }

    //遍历后l为target第一次出现的位置
    if (nums[l] == target) {
        var i = l + 1
        while (nums[i] == target) {
            i++
        }
        return [l, i - 1]
    }
    return [-1, -1];
};

//输入: [1,2,3,4,5], k=4, x=3
//输出: [1,2,3,4]
var findClosestElements = function (arr, k, x) {

    var l = 0, r = arr.length - 1, mid, index
    while (l < r) {
        mid = parseInt((l + r) / 2);
        if (arr[mid] === x) {
            index = mid
            break
        } else if (arr[mid] > x) {
            r = mid - 1
        } else {
            l = mid + 1
        }
    }
    if (l > 0 && Math.abs(arr[l] - x) >= Math.abs(arr[l - 1] - x)) {
        l--
    }

    index = l

    if (!index) {
        return arr.slice(0, k)
    }

    var lowIndex = index - 1;
    var heightIndex = index + 1;

    while (heightIndex - lowIndex - 1 < k) {
        if (lowIndex < 0) {
            heightIndex++
            continue
        }
        if (heightIndex >= arr.length) {
            lowIndex--
            continue
        }

        if (arr[heightIndex] - x < x - arr[lowIndex]) {
            heightIndex++
        } else {
            lowIndex--
        }
    }

    return arr.slice(lowIndex + 1, heightIndex)
};

//[0,1,1,1,2,3,6,7,8]
//console.log(findClosestElements([1, 2, 3, 4, 5], 4, 3))
//console.log(findClosestElements([0, 1, 1, 1, 2, 3, 6, 7, 8, 9], 9, 4))
//console.log(findClosestElements([1, 1, 1, 10, 10, 10], 1, 9))




var isPerfectSquare = function (num) {
    var l = 0, r = num, mid, ans
    while (l <= r) {
        mid = (l + r) >> 1;
        ans = mid * mid
        if (ans === num) {
            return true
        } else if (ans > num) {
            r = mid - 1
        } else {
            l = mid + 1
        }
    }
    return false
};

//console.log(isPerfectSquare(16))

var findString = function (words, s) {
    var l = 0, r = words.length - 1, mid;
    while (l <= r) {
        mid = parseInt((l + r) / 2);
        //向右区间寻找非空字符
        while (mid <= r && !words[mid]) { mid++ }
        //当右侧全为空字符时向左寻找
        if (mid > r) {
            r = parseInt((l + r) / 2) - 1
            continue
        }
        //mid 不为空
        if (words[mid] === s) {
            return mid
        } else if (words[mid] > s) {
            r = mid - 1
        } else {
            l = mid + 1
        }
    }
    return -1
};

//["at", "", "", "", "ball", "", "", "car", "", "","dad", "", ""]

//console.log(findString(["at", "", "", "", "ball", "", "", "car", "", "", "dad", "", ""], "d"))



var bestSeqAtIndex = function (height, weight) {
    var arr = []
    for (var i = 0; i < height.length; i++) {
        arr.push([height[i], weight[i]])
    }

    arr.sort((a, b) => a[0] - b[0]);

    console.log('arr', arr)
    var current = 0;
    var ans = 0
    for (var i = 0; i < arr.length; i++) {
        var v = arr[i][1];
        //和上一次的对比
        if (v > current) {
            ans++;
            current = v
        }
    }
    return ans
};

var height = [2868, 5485, 1356, 1306, 6017, 8941, 7535, 4941, 6331, 6181]
var weight = [5042, 3995, 7985, 1651, 5991, 7036, 9391, 428, 7561, 8594]

//console.log(bestSeqAtIndex(height, weight))


var islandPerimeter = function (grid) {
    //四条边只要每条边相邻没有1就+1
    let index = 0
    for (let i = 0; i < grid.length; i++) {
        let item = grid[i];
        for (let k = 0; k < item.length; k++) {
            if (item[k] === 1) {
                //上边
                let top = grid[i - 1] && grid[i - 1][k];
                let bottom = grid[i + 1] && grid[i + 1][k];
                let left = item[k - 1];
                let right = item[k + 1]
                if (!top) {
                    index++
                }
                if (!bottom) {
                    index++
                }
                if (!left) {
                    index++
                }
                if (!right) {
                    index++
                }
            }
        }
    }
    console.log('index', index)
    return index
};

var t = [[0, 1, 0, 0],
[1, 1, 1, 0],
[0, 1, 0, 0],
[1, 1, 0, 0]]


// 7
// [2,3,1,2,4,3]
/*
(2,3,1,2),4,3    ans =3   l=0  -> l =1

2,(3,1,2,4),3   ans =3    l=1  -> l=3 



*/

//双指针法
var minSubArrayLen = function (s, nums) {
    let l = 0,
        r = 0,
        ans = -1,
        sum = 0,
        n = nums.length;

    for (; r < n; r++) {
        sum += nums[r];
        //移动左边指针到sum小于s ，统计最小区间长度
        while (sum >= s) {
            if (ans < 0 || (r - l < ans)) {
                ans = r - l
            }
            sum -= nums[l];
            l++
        }
    }

    return ans + 1
};
//minSubArrayLen(7, [2, 3, 1, 2, 4, 3])
//minSubArrayLen(15, [5, 1, 3, 5, 10, 7, 4, 9, 2, 8])

var isPalindrome = function (s) {
    let l = s.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
    let r = l.split('').reverse().join('').toLowerCase();
    console.log(l, r)
    return l === r
};

//isPalindrome("A man, a plan, a canal: Panama")


var kthToLast = function (head, k) {
    let i = 0, l = head, cur = head;
    while (cur) {
        if (i < k) {
            i++
        } else {
            l = l.next
        }
        cur = cur.next
    }
    return l.val
};

//kthToLast(test3, 2)

/*
输入：words = ["I","am","a","student","from","a","university","in","a","city"], 
     word1 = "a", word2 = "student"
输出：1

双指针 
*/
var findClosest = function (words, word1, word2) {

    let l,
        r = 0,
        ans = Number.MAX_SAFE_INTEGER,
        pre,
        cur,
        n = words.length;
    for (; r < n; r++) {
        pre = l && words[l];
        cur = words[r];
        if (cur === word1 || cur === word2) {
            //当存在左节点，并且右节点和左节点不同
            if (l !== undefined && cur !== pre) {
                ans = r - l > ans ? ans : r - l
            }
            l = r
        }
    }

    return ans
};

//findClosest(["I", "am", "a", "student", "from", "a", "university", "in", "a", "city"], "a", "student")


//请从字符串中找出一个最长的不包含重复字符的子字符串，计算该最长子字符串的长度。
var lengthOfLongestSubstring = function (s) {
    let l = 0,
        r = 0,
        n = s.length,
        ans = 0;

    for (; r < n; r++) {
        let cur = s[r];
        let index = s.slice(l, r).indexOf(cur);

        if (index > -1) {
            //出现重复计算长度后移动左节点
            ans = Math.max(ans, r - l);
            //+1 为重复节点的下一个位置
            l = l + index + 1;
        } else {
            //无重复节点的时候累加
            ans = Math.max(r - l + 1, ans)
        }
    }
    return ans;
};

//lengthOfLongestSubstring("nfpdmpi")


var sortArrayByParityII = function (A) {
    let n = A.length,
        l = 1,
        r = 0,
        temp
    for (; r < n; r += 2) {
        //偶数为存在基数，则从基数为中寻找偶数
        if (A[r] & 1) {
            while (A[l] & 1) {
                l += 2
            }
            temp = A[i];
            A[i] = A[j];
            A[j] = temp;
        }
    }
    return A
};


var oddEvenListData = {
    v: 1,
    next: {
        v: 2,
        next: {
            v: 3,
            next: {
                v: 4,
                next: {
                    v: 5,
                    next: null
                }
            }
        }
    }
}


var oddEvenList = function (head) {
    if (!head || !head.next) return head
    //定义奇数偶数链表头
    let evenHead = head,
        oddHead = head.next,
        odd = { next: null },
        even = { next: null },

        i = 0;
    while (head) {
        if (!(i % 2)) {
            even.next = head
            even = head
        } else {
            odd.next = head
            odd = head
        }
        head = head.next;
        i++;
    }


    odd.next = null
    even.next = oddHead

    return evenHead
};


var oddEvenList2 = function (head) {
    if (!head || !head.next) return head
    //定义奇数偶数链表头
    let evenHead = head.next;
    let odd = head
    let even = head.next

    while (even && even.next) {
        odd.next = even.next
        odd = odd.next

        even.next = odd.next
        even = even.next
    }
    odd.next = evenHead

    return head
};



//oddEvenList(oddEvenListData)
var reconstructQueueData = [[9, 0],
[7, 0],
[6, 0],
[6, 2],
[5, 3],
[5, 2],
[3, 0],
[3, 4],
[2, 7],
[1, 9]]

var reconstructQueue = function (people) {
    let i = 0,
        n = people.length,
        ans = [];
    people.sort((a, b) => b[0] - a[0]);
    people.sort((a, b) => a[1] - b[1]);
    // for (; i < n; i++) {
    //     let item = people[i];
    //     let p = item[1];
    //     //只处理站队靠后的情况 需要向前移动的情况
    //     if (p < i) {
    //         //判断ans中后续元素i-p之间是否有高度小于当前元素的
    //         for(let k=p;k<ans.length;k++){
    //             if(ans[k][0]<item[0]){
    //                 p++
    //             }
    //         }
    //         ans.splice(p, 0, item)
    //     } else {
    //         ans.push(people[i])
    //     }
    // }
    console.log('ans', people)
    return ans

};

//reconstructQueue(reconstructQueueData)


var canCompleteCircuit = function (gas, cost) {
    let n = gas.length,
        i = 0;
    for (; i < n; i++) {
        //初始点的补给量肯定大于等于消耗
        if (gas[i] >= cost[i]) {
            //假设为起点
            let k = i === (n - 1) ? 0 : i + 1;

            let ans = gas[i] - cost[i];
            while (k !== i) {
                ans = ans + gas[k] - cost[k];
                if (ans < 0) break;
                //到达数组最后一位的时候返回第一个位置
                k = k === (n - 1) ? 0 : k + 1;
            }
            if (ans >= 0) {
                return i
            }
        }
    }
    return -1
};

//canCompleteCircuit([3, 3, 4], [3, 4, 4])



var moveZeroes = function (nums) {
    for (let i = nums.length - 1; i >= 0; i--) {
        if (nums[i] === 0) {
            nums.splice(i, 1)
            nums.push(0)
        }
    }
    return nums
};
//moveZeroes([2,1,0,3,12])

//双指针
var moveZeroes2 = function (nums) {
    let n = nums.length,
        l = 0,
        r = 0;
    while (r < n) {
        if (nums[r]) {
            let tmp = nums[r];
            nums[r] = nums[l]
            nums[l] = tmp
            l++
        }
        r++
    }
    return nums
};


var removeElement = function (nums, val) {
    for (let i = nums.length - 1; i >= 0; i--) {
        if (nums[i] === val) {
            nums.splice(i, 1)
        }
    }
    console.log(nums)
    return nums
};
var removeElement2 = function (nums, val) {

    var i = 0;
    for (var j = 0; j < nums.length; j++) {
        if (nums[j] !== val) {
            nums[i] = nums[j];
            i++
        }
    }
    return i
};
//removeElement( [3,2,2,3],3)

//[2,6,8,4]
var maxArea = function (height) {
    let max = 0,
        l = 0,
        r = 0
    for (; l < height.length; l++) {
        r = 0
        for (; r < height.length; r++) {
            let w = r - l;
            let h = Math.min(height[l], height[r]);
            max = Math.max(max, w * h)
        }
    }
    return max
};

/*
相同情况下距离越远越好
区域受限于较短边
*/
var maxArea2 = function (height) {
    let max = 0,
        l = 0,
        r = height.length - 1
    while (l < r) {
        max = Math.max(max, (r - l) * Math.min(height[l], height[r]))

        if (height[r] >= height[l]) {
            l++
        } else {
            r--
        }
    }
    return max
};
//maxArea2([7 ,1, 1, 1, 1, 10, 8])

var insertionSortListData = {
    val: 4,
    next: {
        val: 2,
        next: {
            val: 1,
            next: {
                val: 3,
                next: null
            }
        }
    }
}
var insertionSortList = function (head) {
    if (!head) return head
    let ans = [];
    while (head) {
        ans.push(head)
        head = head.next
    }

    ans.sort((a, b) => a.val - b.val)

    for (let i = 0; i < ans.length; i++) {
        ans[i].next = ans[i + 1] || null
    }

    return ans[0]

};

//insertionSortList(insertionSortListData)

var insertionSortList2 = function (head) {
    let dummyHead = { next: head }
    let lastSorted = head
    head = head.next;

    while (head) {
        if (head.val >= lastSorted.val) {
            lastSorted = lastSorted.next
        } else {
            //找到插入的点的前一个节点
            let prev = dummyHead
            while (prev.next.val < head.val) {
                prev = prev.next
            }
            lastSorted.next = head.next;
            head.next = prev.next
            prev.next = head
        }
        head = lastSorted.next
    }
    console.log(dummyHead.next)
    return dummyHead.next;
}

//insertionSortList2(insertionSortListData)



/*

23   44

查找所有二维数组的交集
存在交集的方式：
    b.start <= a.end <= b.end   ||
    b.start <= a.start <= b.end  ||
   ( b.start <= a.end <= b.end  &&  b.start <= a.start <= b.end )  ||
   a.start <= b.start && a.end >= b.end

  满足max(A.start,B.start)<=min(A.end,B.end)，即重复 
  满足A.end< B.start || A.start > B.end，即不重复

*/


//右边界升序
var findMinArrowShots = function (points) {
    if (!points.length) {
        return 0;
    }
    points.sort((a, b) => a[1] - b[1])

    let point = points[0][1];
    let ans = 1
    for (let item of points) {
        if (item[0] > point) {
            point = item[1]
            ans++
        }
    }

    return ans
};
//左边界升序
var findMinArrowShots2Data = [[3, 9], [7, 12], [3, 8], [6, 8], [9, 10], [2, 9], [0, 9], [3, 9], [0, 6], [2, 8]]
var findMinArrowShots2 = function (points) {
    if (!points.length) {
        return 0;
    }
    points.sort((a, b) => a[0] - b[0])

    let point = points[0][1];
    let ans = 1
    for (let item of points) {
        if (item[0] > point) {
            point = item[1]
            ans++
        }
    }

    return ans
};

//findMinArrowShots2(findMinArrowShots2Data)

//广度优先搜索
var countNodes = function (root) {
    let r = 0,
        ans = [root];

    while (ans.length) {
        let item = ans[r];
        if (!item) break
        r++
        item.left && ans.push(item.left);
        item.right && ans.push(item.right);
    }

    return r
}

//深度优先搜索
var countNodes = function (root) {

    if (!root.length) return 0

    return 1 + countNodes(root.left) + countNodes(root.right)

}


var sortString = function (s) {
    let i = 0,
        k = 0,
        aCode = "a".charCodeAt();
    let cache = [];
    let ans = ''
    //排序
    for (; i < s.length; i++) {
        let index = s[i].charCodeAt() - aCode;
        cache[index] = (cache[index] || 0) + 1;
    }
    i = 0;
    for (; i < s.length; i++) {
        k = 0
        //从小到大取
        for (; k < cache.length; k++) {
            if (cache[k] > 0) {
                ans += String.fromCharCode(aCode + k);
                cache[k]--
            }
        }
        k = cache.length - 1;
        //从大到小取
        for (; k >= 0; k--) {
            if (cache[k] > 0) {
                ans += String.fromCharCode(aCode + k);
                cache[k]--
            }
        }
    }
    return ans
};


//sortString("leetcode")


var maximumGap = function (nums) {
    let i = 0,
        n = nums.length,
        ans = 0;
    if (n < 2) return 0;

    nums.sort((a, b) => a - b);

    for (; i < n - 1; i++) {
        ans = Math.max(nums[i + 1] - nums[i], ans)
    }

    console.log(ans)
    return ans

};

//maximumGap([3,6,9,1])

var searchRange = function (nums, target) {
    let l = 0,
        mid = 0,
        ans = [-1, -1],
        r = nums.length - 1;
    while (l <= r) {
        mid = parseInt((l + r) / 2)
        if (nums[mid] < target) {
            l = mid + 1
        } else if (nums[mid] > target) {
            r = mid - 1
        } else {
            console.log(mid)
            ans = [mid, mid]
            //左右遍历
            for (l = mid - 1; l >= -1; l--) {
                if (nums[l] !== nums[mid]) {
                    ans[0] = l + 1
                    break
                }
            }
            for (r = mid + 1; r <= nums.length; r++) {
                if (nums[r] !== nums[mid]) {
                    ans[1] = r - 1
                    break
                }
            }
            break
        }
    }
    console.log(ans)
    return ans
};

//searchRange([1,1, 2], 1)


var map = {
    '(': ')',
    '{': '}',
    '[': ']'
}

var isValid = function (s) {
    var r = 1
    var l = 0

    for (; r < s.length; r++) {
        if (map[s[r]]) {
            l++
        } else if (map[s[l]] === s[r]) {

        }
    }
    return true
};


/*
[7,8,9,10]
[5,6,7,8]
*/
var findContentChildren = function (g, s) {
    g.sort((a, b) => a - b);
    s.sort((a, b) => a - b);
    let i = 0, j = 0;
    while (i < g.length && j < s.length) {
        if (g[i] <= s[j]) {
            i++
        }
        j++
    }
    return i
};


//var res = findContentChildren([10, 9, 8, 7], [5, 6, 7, 8])




/** 2. 寻找特定 IP
IPV4 的 IP 地址是32位的二进制数，为增强可读性，通常我们以8位为1组进行分割，
用十进制来表示每一部分，并用点号连接，譬如 192.168.1.1。显然，存在这样的 IP 地址，
0到9十个数字各出现一次。具备这样特征的 IP 地址里，表示成二进制数时，二进制数左右对称
（也就是“回文”，表示成32位二进制不省略0）的情况有几种，分别是哪些？要求性能尽可能高
*/

//8位一组 [11111111 00000000 00000000 11111111]
//parseInt(11010101,2) 198.toString(2)
//满足两个条件
//1.回文字符串
//2.0到9十个数字各出现一次
//动态规划



//防抖
/*
场景：搜索
需要解决的问题:输入会连续触发检索调用接口。
解决办法:连续输入等停顿足够时间后在发起查询


// 函数防抖： 在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时。


*/

function debounce(fn, delay) {
    let timer = null;

    return function () {
        let arg = arguments;
        let _this = this;
        if (timer) {
            clearTimeout(timer)
        }

        timer = setTimeout(() => {
            fn.apply(_this, arg)
        }, delay)
    }
}

let debounceTest = debounce((name) => {
    console.log(name)
}, 200);

//debounceTest('csq');
//debounceTest('bei');


//节流：事件n秒内只能触发一次
function throttle(fn, delay) {

    let timer = null

    return function () {

        if (timer) return;

        fn.apply(this, arguments);

        timer = setTimeout(() => {
            timer = null;
        }, delay)
    }

}

let testddddd = throttle(function (name) {
    console.log(name)
}, 100)

//testddddd("aaa")
//testddddd("bbb")


function machine(name) {

    this.name = name;

    this.cache = []

}

machine.prototype = {
    constructor: machine,
    execute: function () {
        console.log('start ' + this.name);
        return this;
    },
    do: function () {
        console.log(this.name + ' eat');

        this.cache.push()
        return this;
    },
    wait: function () {
        return this;
    },
    waitFirst: function () {
        return this;
    }
}



//machine('robot').execute()
// start robot
//machine('robot').do('eat').execute();
// start robot
// robot eat
//machine('robot').wait(5).do('eat').execute();
// start robot
// wait 5s（这里等待了5s）
// robot eat
//machine('robot').waitFirst(5).do('eat').execute();
// wait 5s
// start robot
// robot eat

//分析 执行优先级  waitFirst > execute  >wait > do 


//STAR 原则  背景、任务、行为、结果


//函数柯里化是把一个带多参数的函数转变成多个带参数的函数技术




let state = {
    value: 1,
    children: [
        {
            value: 2, children: [
                { value: 4, children: null },
                { value: 5, children: null }
            ]
        },
        { value: 3, children: null }
    ]
}

//深度优先遍历
function dft(obj) {
    console.log(obj.value);

    if (!obj.children) return

    obj.children.map((item) => {
        dft(item)
    })
}

//广度优先遍历
function dft2(obj) {
    console.log(obj.value);

    if (!obj.children) return

    obj.children.map((item) => {
        dft(item)
    })
}
