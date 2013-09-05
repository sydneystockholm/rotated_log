var child = require('child_process')
  , format = require('util').format
  , path = require('path')
  , fs = require('fs');

function LogStream(path, resume_point) {
    this.resume_point = resume_point || 0;
    this.path = path;
}

LogStream.prototype.stream = function (callback) {
    var command = [ format('tail -F -c +0 "%s"', this.path) ]
      , self = this;
    function finish() {
        callback(null, self.streamCommand(command.join(' && ')));
    }
    this.getLogs(function (err, logs) {
        if (err) return callback(err);
        self.startPoint(self.path, function (err, timestamp) {
            if (err) return callback(err);
            if (timestamp !== null && timestamp <= self.resume_point) {
                return finish();
            }
            (function next() {
                if (!logs.length) {
                    if (!self.resume_point) {
                        return finish();
                    }
                    return callback(new Error('Could not locate start point'));
                }
                var log = logs.shift();
                command.unshift(self.catCommand(log));
                self.startPoint(log, function (err, timestamp) {
                    if (err) return callback(err);
                    if (timestamp !== null && timestamp <= self.resume_point) {
                        return finish();
                    }
                    next();
                });
            })();
        });
    });
};

LogStream.prototype.streamCommand = function (command) {
    return child.spawn('sh', [ '-c', command ]).stdout;
};

LogStream.prototype.catCommand = function (file) {
    var command, ext = path.extname(file);
    switch (ext) {
    case '.xz':
        command = 'xzcat';
        break;
    case '.bz2':
        command = 'bzcat';
        break;
    case '.gz':
        command = 'gzip -dc';
        break;
    default:
        command = 'cat';
        break;
    }
    return format('%s "%s"', command, file);
};

LogStream.prototype.head = function (file, callback) {
    child.exec(this.catCommand(file) + ' | head -1', callback);
};

LogStream.prototype.startPoint = function (file, callback) {
    this.head(file, function (err, line, stderr) {
        if (err) return callback(err);
        if (stderr && stderr.indexOf('Broken pipe') === -1) return callback(new Error(stderr));
        var timestamp = line.split(' ', 1)[0].replace(/\./g, '');
        callback(null, timestamp.length ? Number(timestamp) : null);
    });
};

LogStream.prototype.getLogs = function (callback) {
    var dirname = path.dirname(this.path)
      , log = path.basename(this.path);
    fs.readdir(dirname, function (err, files) {
        if (err) return callback(err);
        callback(null, files.filter(function (file) {
            return file.indexOf(log + '-') === 0;
        }).sort(function (a, b) {
            return a > b ? -1 : 1;
        }).map(function (log) {
            return path.join(dirname, log);
        }));
    });
};

exports.LogStream = LogStream;

exports.stream = function (path, resume_point, callback) {
    if (typeof resume_point === 'function') {
        callback = resume_point;
        resume_point = 0;
    }
    var log = new LogStream(path, resume_point);
    log.stream(callback);
};

