> "  
> nodejs和javascript语法摘抄  

原文：[重新介绍JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/A_re-introduction_to_JavaScript)


0. 历史  
    1995 Netscape创造，LiveScript后改名JavaScript  
    1996 用在NetScope2上；几个月后MS推出JScript；NEtScope基于市场考虑，提交至Ecma进行标准化  
    1997 第一版标准版出世，ECMAScript  
    1999 第三版发布，第四版未形成标准被废除  
    2009 12月发布第五版，引入了很多第四版的特性  
    2015 6月第六版发布

0. 预定义类型  
    - Number 内部是double,特殊值NaN, Infinity, -Infinity, 用ifNaN判断NaN； 用isFinite判断NaN，Infinity，-Infinity
    - String
    - Boolean  false,0,"",NaN,null,undefined 被转换成false
    - Symbol(ECMA6)
    - Object
        - Function
        - Array
        - Date
        - RegExp
    - Null
    - Undefined

0. 控制结构和运算符与C一致,相等操作有 == 和 === 两类， 后者不进行类型转换，需要类型和值都相等  

0. 对象  
    js的对象可以简单理解为'名称-值'对，所以和以下概念类似：
    - python的字典
    - C/C++的散列表
    - Java的HashMap
    - PHP的关联数组
    
    js中一切皆是对象，对象的名称部分是Js的字符串，值部分可以是任何的JS数据类型--包括对象。  
    创建对象的方法有两种:
    ~~~
    var obj = new Object();
    var obj = {};
    ~~~
    
    第二种是JSON格式的核心语法，一般优先选择第二种方法。  
    第一种是通过先创建一个对象原型，再对这个原型进行实例化来创建对象的。  
    对象的属性值可以通过以下两种方法来访问：
    ~~~
    var name = obj.name;
    var name = obj['name'];
    ~~~
    
    第二种访问方式的优点在于属性的名称被看成是个字符串，所以被计算:
    ~~~
    var item = 'name';
    var name = obj[item];
 ~~~

0. 数组  
    数组是一个特殊的对象，以数字为属性名，只能通过[]来访问，数组对象有个特殊的属性`length`。  
    `length`属性比数组最大索引大1，所以不总是等于数组中元素的个数。
    ~~~
    var a = ["dog", "cat", "hen"];
    a[100] = "fox";
    a.length; // 101
    typeof a[90]; //undefined
    ~~~
    
    遍历数组使用`for...in`循环,或`for...of`循环, 或者使用数组对象的方法`forEach(callback)`(ES5)
    数组常用的方法还有
    ~~~
    a.toString();
    a.toLocalString();
    a.concat(a1[, a2[, a3[, ...[, an]]]]);
    a.join(sep = ',');
    a.pop();
    a.push(item1, item2, ...);
    a.reverse(); //更改原数组
    a.shift();
    a.unshift(item1, item2, ...);
    a.slice(start, end);
    a.sort(cmpfn);
    a.splice(start, delcount[, item1[, ...[, itemN]]]); //相当于a.slice(start, start+delcount); a.push(item1, ...itemN);
    ~~~

0. 函数
    ~~~
    function add(x, y){
     var total = x + y;
     return total;
    }
    add(1);
    add(1,2);
    add(1,2,3);
    ~~~
    
    函数如果没有return语句，默认返回undefined。  
    已命名的函数参数起指示作用，如果实参少于形参，缺少的参数以undefined代替；实参多余形参，多余部分丢弃。  
    函数体中有一个arguments变量，他不是数组尽管他有length属性，但是没有push,pop,slice方法。他类似数组，存储了所有传入的参数，可以for循环。  
    函数有自己的作用域（没有块级作用域），如果函数作用域没找到变量，就到外层作用域找。  
    函数中有些变量用this关键字引起，this指代的是调用函数的对象。如果在对象上使用点或者[]来访问属性或者方法，这个对象就是this。  
    如果没有使用点调用某个对象，则this指向全局对象(global object).  
    ~~~
    function makePerson(first, last){
     return {
         first: first,
         last: last,
         fullName: function(){
             return this.first + ' ' + this.last;
         }
     }
    }
    s = makePerson('Simon', 'Willison');
    s.fullName();   //Simon Willison
    s["fullName"](); //Silmon Willison
    var fullName = s.fullName();
    fullName(); //这里执行时, this指向全局对象，所以 undefined undefined
    ~~~

0. 对象和函数
    JS最重要的就是函数和对象两个部分。把这两个部分结合起来的就是关键字~new~
    ~new~和~this~密切相关
    ~new~的一个简单实现是:
    ~~~
    function Person(first, last){
     this.first = first;
     this.last = last;
     this.fullName = function(){
         return this.first + ' ' + this.last;
     }
    }
    function New(Constructor){
     var o = {};
     return function(){
         o.apply(Constructor, arguments);
         return o;
     }
    }
    var a = new Person('first', 'last'));
    var b = New(Person)('first', 'last');
    ~~~
    
    所以new其实就是新建了一个空对象，在这个空对象上调用了构造函数（对象原型）。构造除了对象的各种属性。  
    在这里还有个瑕疵的地方，就是每次创建新的Person对象时，都需要创建新的函数对象，即fullName方法。  
    一般对象的属性各异，但是方法是可以共享的。解决的这个办法的问题有两个:  
    一个是把方法定义在外面，构造函数中直接引用。  
    一个是添加到对象的prototype属性中。当你试图访问一个对象没有定义的属性时，解释器会检查这个对象的prototype中是否存在这样一个属性。  
    对于对象的prototype相关的内容，单独记录一篇。这主要涉及到JS的面向对象编程的内容。  

0. 内部函数和闭包  
    函数内部定义的函数，可以访问父函数作用域中的变量；可以减少全局函数的数量，便于维护;  
    内部函数使用的变量会被父函数作用域中相同名字的变量隔绝，可以防止内部函数污染全局变量，  
    但是应该谨慎使用这个特性。  
    闭包和内部函数类似，唯一不同的是内部函数被外部函数返回了，导致外部函数结束，但是其局部变量依旧存在。  
    原因如下：  
    ~~~
    function makeAdder(a) {
     return function(b) {
         return a + b;
     };
    }
    x = makeAddr(5);
    x(6); //11
    x(7); //13;
    ~~~
    
    js执行一个函数时，会创建一个作用域对象（scope object）用来保存这个函数中创建的局部变量，  
    和被传入的参数变量一起初始化；这和保存全局变量和函数的全局对象（global object）类似。但是有一些区别:  
    _每次执行一个函数都创建一个新的_  
    _局部作用域不能直接访问，也不能遍历里面的属性和方法_  
    通常js的垃圾回收器会在函数返回时回收这个函数创建的作用域对象，但是返回的函数却保留了一个指向那个作用域对象的引用。  
    导致的结果就是这个作用域对象不会被垃圾回收器回收。
    
    >在函数中被创建且返回的内部函数，以及该函数的作用域对象的组合 就是一个闭包
    
    闭包处理不当容易发生内存泄露，当对作用域对象形成循环引用时。原文的例子是浏览器的，看不懂不深究。



  

