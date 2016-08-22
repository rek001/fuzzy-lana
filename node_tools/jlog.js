#! /usr/bin/env node
var fs = require('fs');
var util = require('util');
var Emitter = require('events').EventEmitter;

var file = './history.log';
var tags = ['timestamp', 'pid', 'level', 'module', 'msg'];

if(process.argv.length == 2){
    console.log('using default args ./history.log -t timestamp,pid,level,module,msg');
}else if(process.argv.length == 3){
    file = process.argv[2];
}else if(process.argv.length >= 4 && (process.argv[2] == '-t' || process.argv[2] == '--tag')){
    file = process.argv[4] || file;
    tags = process.argv[3].split(",");
}else{
    console.log('Usage: jlog [-t tag1,tag2,tag3...] [file]');
    process.exit(-1);
}
try{
    fs.accessSync(file, fs.R_OK);
}catch(e){
    if(e){
        console.log(e);
        console.log('Can not read',file, '. Does it exist ?');
        process.exit(-1);
    }
}

function Watcher(file, tags, start = -10000) {
    if(!(this instanceof Watcher)) return new Watcher(file, tags);
    this.buff = '';
    this.posEnd = fs.statSync(file).size;
    this.posStart =  this.posEnd + start < 0 ? 0 : this.posEnd + start;
    this.file = file;
    this.tags = tags;
    this.readAndPrint();
    this.on('change', () => {
        this.readAndPrint();
    });
    fs.watch(this.file, {persistent: true, interval: 2000}, (event, filename) => {
        this.handleWatchEv(event);
    });
}
util.inherits(Watcher, Emitter);

Watcher.prototype.handleWatchEv = function(event){
    if(event === 'change'){
        fs.stat(this.file, (err, stat) => {
            if(err){
                console.log('error happend');
            }
            if(stat.size != this.posEnd){
                this.posStart = this.posEnd;
                this.posEnd = stat.size;
                this.emit(event);
            }
        })
    }
};

Watcher.prototype.readAndPrint = function() {
    let self = this;
    let stream = fs.createReadStream(this.file, {start: this.posStart, end: this.posEnd});
    stream.on('error', (err) => {
        console.log('error happend.');
        if (stream.readable) {
            stream.destroy();
        }
    });
    stream.on('data', (data) => {
        let lines = (/*this.buff + */data).split(/\n/);
        this.buff = '';
        lines.forEach((line, index) => {
            let j ;
            try{
                if(line){
                    j = JSON.parse(line);
                    let logLine = '';
                    for(let tag of this.tags){
                        logLine += util.format('%s ', j[tag]);
                    }
                    console.log(logLine);
                }
            } catch (e) {
                console.log('json parse fail, initial line: ', line);
                // this.buff += line;
            }
        });
    });
};

var w = Watcher(file, tags);

