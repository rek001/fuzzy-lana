>"  
>异步编程，简单讲就是一个任务的执行分成两段，先执行一段，然后转而执行其他任务，等做好了准备，再回过头执行第二段。

node和JS的执行环境都是“单线程”，所以耗时很长的操作都应该异步执行，尤其是服务器端，异步模式是唯一的模式。  
异步编程最基本的方法是传递回调函数，即把任务第二段单独放在一个函数(callback)里，等到重新执行这个任务的时候，就直接调用这个函数。
例如，读取文件：

    ~~~
    fs.readFile('/etc/passwd', function(err, data) {
        if(err) throw err;
        console.log(data);
    }
    ~~~
fs.readFile的第二个参数就是任务的第二段，即回调函数。  
Node中约定，回调函数的第一个参数必须是错误对象(如果没有错误，该参数是null).因为在两段之间抛出的错误，程序无法捕捉，只能当做参数，传入第二段。  
回调函数本身没有问题，问题出现在相互依赖的多个任务导致的多个回调函数嵌套时，出现的：  
- 函数嵌套过深，容易形成恶魔金字塔结构，这使得代码变得难理解，也使得调试、重构的过程充满风险。  
- 错误处理变得复杂。  
    
下面来介绍几种优化异步编程结构的模式。  

0. 事件订阅  
todo

0. Promise  
    通过Promise，可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。这使的异步回调函数风格显得更像同步编程风格。  
    Promise简单说就是一个容器，保存着某个未来才会结束的事件（通常是一个异步操作）的结果，代码示例如下：
    ~~~
    $.ajax('/stuff', {
        success: function(){
            console.log('Success.');
        },
        error: function(){
            console.log('Failed');
        }
    });
    ~~~
    
    成功和失败回调处理函数直接传递给$.ajax函数，这是传统的事件回调处理方式。如果，get /stuff成功之后，还需要 get /morestuff，代码如下:
    
    ~~~
    $.ajax('/stuff', {
            success: function(){
                $.ajax('/morestuff', {
                    success: function(){
                        console.log('Success.');
                    },
                    error: function(){
                        console.log('Failed');
                    }
                });
            },
            error: function(){
                console.log('Failed');
            }
        });
    ~~~
        
    即，嵌套第二个ajax调用到第一个中。这样随着嵌套的深入，代码发生重复，错误处理也容易被遗漏。  
    如果改成Promise模式处理,则是这样：
    
    ~~~
    fetch('/stuff')
        .then(function(){
            return fetch('/morestuff');
        })
        .then(function(){
            console.log('Success');
        })
        .catch(function(){
            console.log('Failed');
        });
    
    function fetch(url) {
        return new Promise(function(resolve, reject) {
            $.ajax(url, {
                success: function(){
                    resolve();
                },
                error: function(){
                    reject();
                }
            }
        });
    }    
    ~~~
    这里fetch函数是利用ES6的Promise模式对ajax请求调用的封装，返回一个Promise对象。在promise模式中，通过调用then函数注册成功处理函数；通过catch函数注册失败处理函数。  
    在这个例子中，通过Promise模式，使得回调树变得扁平，也避免了错误处理逻辑到处重复。

0. Generator函数和协程  
    协程，协同程序，和子程序或称函数一样，也是一种程序组件。相对于子程序，协程更为一般和灵活。  
    子程序的起始处是唯一的入口点，一旦退出完成子程序的执行，子程序只返回一次。  
    协程的起始处是第一个入口点，每个返回点之后是接下来的入口点。和子程序生命周期遵循先进后出不同，协程的生命期完全由他们的使用的需要决定。  
    协程通过yield来调用其他协程，通过yield方式转移执行权的协程之间不是调用者和被调用者关系，而是彼此对称，平等的。  
    子程序是通过栈来实现的，因为子程序调用其他子程序作为下级。协程对等地调用其他协程，最好的实现是有垃圾回收机制的堆，以跟踪控制流程。  
    协程可以有多个入口和出口，可以用来实现任何子程序。事实上，如Knuth所说“子程序是协程的特例”。  
    协程更适合于用来实现彼此熟悉的程序组件，如合作式多任务，迭代器，无限列表，管道，状态机，角色模型，产生器。
    
    在一些场景下，使用协程显得很自然。但是支持协程的语言（语言内置或者标准库）比较少。典型的解决方案有：  
    * 创建一个子程序，它用布尔标志的集合以及其他状态变量在调用之间维护内部状态。代码中基于这些状态变量的值用条件语句产生出不同执行路径以及后续的函数调用。  
    * 用一个庞大而复杂的switch语句实现一个显式的状态机。这种方法实现理解和维护都很困难。  
    * 多线程。这是当前主流编程环境的做法，被广泛的实现，文档化和支持。  
    相比多线程，协程相当于在一个线程中运行，故而没有线程切换的开销，也不需要多线程的锁机制，不会存在写变量冲突。  
    
    另外，在[ES6入门-阮一峰.Generator函数章节](http://es6.ruanyifeng.com/#docs/generator)中，对协程的说明：  
    > 传统的“子例程”（subroutine）采用堆栈式“后进先出”的执行方式，只有当调用的子函数完全执行完毕，才会结束执行父函数。
    > 协程与其不同，多个线程（单线程情况下，即多个函数）可以并行执行，但是只有一个线程（或函数）处于正在运行的状态，其他线程（或函数）都处于暂停态（suspended），线程（或函数）之间可以交换执行权。
    > 也就是说，一个线程（或函数）执行到一半，可以暂停执行，将执行权交给另一个线程（或函数），等到稍后收回执行权的时候，再恢复执行。这种可以并行执行、交换执行权的线程（或函数），就称为协程。
    > 从实现上看，在内存中，子例程只使用一个栈（stack），而协程是同时存在多个栈，但只有一个栈是在运行状态，也就是说，协程是以多占用内存为代价，实现多任务的并行。  
    > 普通的线程是抢先式的，到底哪个线程优先得到资源，必须由运行环境决定，但是协程是合作式的，执行权由协程自己分配.  
    > Generator函数是ECMAScript 6对协程的实现，但属于不完全实现。Generator函数被称为“半协程”（semi-coroutine），意思是只有Generator函数的调用者，才能将程序的执行权还给Generator函数。
    > 如果是完全执行的协程，任何函数都可以让暂停的协程继续执行。如果将Generator函数当作协程，完全可以将多个需要互相协作的任务写成Generator函数，它们之间使用yield语句交换控制权。
    
    在JS中，协程的概念是通过Generator来实现的，  
    JS的Generator代码示例：  
    ~~~
    function* test(p){          //generator函数的定义，在function关键字和函数名之间有一个*
        console.log(p);
        var a = yield p + 1;    //函数体内有yield语句
        console.log(a);
    }
    var g = test(1);    //调用generator函数返回一个指向generator内部状态的遍历器对象 g=>{}
    var ret = g.next();  //调用遍历器对象的next方法,使内部状态移向下一状态，即generator函数从上一次停下的地方开始执行，到下一个yield语句或者return语句。g=>{'value':2, 'done':false}
    console.log(ret);
    ret = g.next(ret.value + 1);  //next的唯一参数可以作为yield的整体返回值，继续执行. g=>{'done':true}; yield语句本来返回值是undefined，如果没有next参数，则a=undefined
    console.log(ret);
    ~~~
    另外，还有一些Generator遍历器对象的其他方法。  
    利用Generator函数可以实现控制流程管理：  
    ~~~
    step1(function(value1){
        step2(function(value2){
            step2(function(value3){
                step4(function(value4){
                    //to some thing 
                });
            });
        });
    });
    //上面这种异步流程处理通过Generator函数可以改写成类似同步处理流程
    function* longRunningTask(){
        var value1 = yield step1();
        var value2 = yield step2(value1);
        var value3 = yield step3(value2);
        var value4 = yield step4(value3);
    }
    scheduler(longRunningTask());
    function longRunningTask(task){
        setTimeout(function(){
            var taskObj = task.next(task.value);
            if(!taskObj.done){
                task.value = taskObj.value;
                scheduler(task);
            }
        },0);
    }
    ~~~
    
0. Async

    
