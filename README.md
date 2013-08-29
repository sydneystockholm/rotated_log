**rotated_log** streams a collection of rotated logs

### Synopsis

Given a log file `access.log` in the following format

```
1376611200000 <some data>
1376611201000 <some data>
1376611202000 <some data>
```

and rotated in the format `$log-$date.{xz,gz,bz2}` so that the directory looks like

```
access.log
access.log-20130801.xz
access.log-20130701.xz
access.log-20130601.xz
```

This library will provide a way to stream (and follow) the entire log when given a timestamp to start from.

### Installation

```bash
$ npm install rotatedlog
```

### Usage

```javascript
var log = require('rotatedlog');

var path = '/path/to/access.log'
  , start_point = 1376611201000;

log.stream(path, start_point, function (err, stream) {

    stream.on('data', function (chunk) {
        // ...
    });

});
```

### Additional notes

- No buffering takes place. You'll need to parse lines yourself if you want line-by-line streaming
- The `start_point` is only used to find the first file to stream, i.e. the final stream may contain some data that was logged before the starting timestamp
- The stream stays open to accept new data (equivalent to a `tail -F $log`)

### License (MIT)

Copyright (c) 2013 Sydney Stockholm <opensource@sydneystockholm.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

