>"  
>winston 日志库Usage翻译

0. Motivation
    Winston简单通用支持多通道(transport)的日志库。一个通道就是一种日志存储设备。每个winston实例可以有多个不同的通道，每个通道可以配置不同的日志级别。  
    这个库的目标是把日志存储的实现和暴露给用户的API解耦开，这让这个库可以更加灵活和易于扩展。
    
0. Installation
    ~~~
    npm install winston
    ~~~
 
0. Usage  
    * Logging  
    两种用法，使用默认logger，或者实例化自己的logger。前者仅仅为了在整个项目中方便地使用共享logger。  
        - 默认logger中，只有Console通道，日志级别为info：
        ~~~
        var winston = require('winston');
        winston.log('info', 'Hello this is an info log');
        winston.info('This is an info log too');
        winston.debug('this is a debug log, yet it will not be print');
        //
        winston.level = 'debug';
        winston.debug('now it will be print');
        winston.add(winston.transports.File, {filename: 'somefile.log' });
        winston.remove(winston.transports.Console);
        ~~~
        
        可以更改日志显示级别，也可以添加或者删除通道,add和remove支持链式调用，如下例所示。
        
        - 也可以自定义logger，以便于控制logger实例的生命周期。
        ~~~
        var logger = new (winston.Logger)({
            level: 'info',
            transports: [
                new (winston.transports.Console)(),
                new (winston.transports.File)({ filename: 'fomefile.log' })
            ]
        });
        logger.log('info', 'Hello, this is an info log by self logger');
        logger.info('another info too');
        logger.add(winston.transports.File).remove(winston.transports.Console);
        //
        //replace the previous transports with these wholesale.
        logger.configure({
            level: 'verbose',
            transports: [
                new (require('winston-daily-rotate-file'))(opts)
            ]
        });
        ~~~
        
        - 除了输出字符串，winston还可以输出任意的nodejs对象。不同通道输出格式不一样，Console和File都是通过util.inspect()进行格式化的。
        !!用util.inspect格式化好像要商榷一下，我实验Console和File都不符合util.inspect的特性。
        
        - 可以指定多个同一类通道。
        ~~~
        var logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    name: 'info-file',
                    filename: 'filelog-info.log',
                    level: 'info'
                }),
                new (winston.transports.File)({
                    name: 'error-file',
                    filename: 'filelog-error.log',
                    level: 'error'
                })
            ]
        });
        //
        //remove the transport later, by string name or by instance itself
        logger.remove('info-file');
        logger.remove(logger.transports[0]);
        ~~~
        
        - log方法还支持和util.format一样的字符串插值方式自定义输出格式。
        ~~~
        logger.log('info', 'test message: %s', 'my string');
        logger.log('info', 'test message: %d', 123);
        logger.log('info', 'test message: %j', {number: 123});
        logger.log('info', 'test message: %s', 'first', {number: 123}); //meta = {number: 123}
        logger.log('info', 'test message: %s', 'first', {number: 123}, function(){}); //meta = {number: 123}, callback = function(){}
        logger.log('info', 'test message: ', 'first', {number: 123}, function(){}); //meta = {number: 123}, callback = function(){}
        ~~~
        
    * Profiling  
    winston有一个简单的profiling(分析)机制：
    ~~~
    winston.profile('test');
    setTimeout(function(){
        //do other things
        //
        winston.profile('test');
    }, 1000);
    ~~~
    这里会输出两次profile之间的时间差 `info: test durationMs=1003`
    
    * Querying Logs  
    winston还支持Loggy-like选项的日志查询接口，支持File，Couchdb，Redis，Loggly,Nssocket和Http通道。
    ~~~
    var options = {
        from: new Date - 24*60*60*1000,
        until: new Date,
        limit： 10，
        start: 0,
        order: 'desc',
        fields: ['message']
    };
    winston.query(options, function(err, results){
        if(err)
            throw err;
         console.log(results);
    });
    ~~~
    
    * Streaming Logs  
    streams取回。
    ~~~
    winston.stream({start: -1}).on('log', function(log){
        console.log(log);
    });
    ~~~
    
    * Exceptions  
    winston可以捕捉并记录异常，同时决定是否退出。
    ~~~
    //add a seprate exception logger 
    var winston = require('winstaon');
    winston.handleExceptions(new winston.transports.File({ filename: 'path/to/exceptionlog' }));
    //add exception msg to transport
    winston.add(winston.transports.File, {
        filename: 'path/to/all-log',
        handleExceptions: true,
        humanReadableUnhandledExeception: true
    });
    //exit if unandle Exception by default. change it by 
    winston.exitOnError = false;
    //or init like this
    var logger = new (winston.Logger)({
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                json: true
            }),
            new winston.transports.File({filename: 'all-other-logs'})
        ],
        exceptionHandlers: [
            new winston.transports.File({
                filename: 'path/to/exception-log'
            })
        ]
        exitOnError: false
    });
    //exitOnError can be function to ignore certain types of errors:
    winston.exitOnError = function(err) {
        return err.code != 'EPIPE';
    }
    ~~~
    
    * Logging Levels  
    winston 支持不同的日志等级系统，默认npm。npm有0-5 共6个等级，syslog有0-8 共9个等级。也可以自定义等级。  
    可以在transports参数里指定最大level参数,也可以给整个logger指定最大level参数，示例见前面。  
    也可以随时改变日志等级系统，默认使用npm系统：
    ~~~
    winston.setLevels(winston.config.syslog.levels);
    var myCunstomLevels = {
        levels: {
            foo: 0,
            bar: 1,
            baz: 2,
            foobar: 3
        },
        colors: {
            foo: 'blue',
            bar: 'green',
            baz: 'yellow',
            foobar: 'red'
        }
    };
    logger = new (winston.Logger)({levels: myCustomLevels});
    //or
    logger.setLevels(myCustomLevels);
    //colors
    logger.addColors(myCustomLevels.colors);
    ~~~
    这个函数会移除原来系统的等级输出函数，定义新系统的输出函数。所以需要注意，新系统可能没有就系统的等级函数。  
    自定义等级系统和颜色
