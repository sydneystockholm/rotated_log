var assert = require('assert')
  , path = require('path')
  , log = require('../lib/stream');

var fixtures = path.join(__dirname, 'fixtures', 'test.log')
  , empty = path.join(__dirname, 'fixtures', 'empty.log');

function assertStreamEquals(stream, expected, done) {
    var data = '';
    stream.on('data', function (chunk) {
        data += chunk.toString();
        if (expected !== data && expected.indexOf(data) === 0) {
            return;
        }
        assert.equal(data, expected);
        stream.destroy();
        done();
    });
    stream.on('end', function () {
        assert(false, 'Expected stream to stay open');
    });
}

describe('Log stream', function () {

    it('should tail the latest log file', function (done) {
        log.stream(fixtures, 410, function (err, stream) {
            assert.ifError(err);
            assertStreamEquals(stream, '400 baz\n410 qux\n', done);
        });
    });

    it('should look backwards in time to find the start point', function (done) {
        log.stream(fixtures, 350, function (err, stream) {
            assert.ifError(err);
            assertStreamEquals(stream, '300 foo\n310 bar\n400 baz\n410 qux\n', done);
        });
    });

    it('should cat all log files when starting from 0', function (done) {
        log.stream(fixtures, 0, function (err, stream) {
            assert.ifError(err);
            var expected = '100 foo\n110 bar\n200 baz\n210 qux\n' +
                '300 foo\n310 bar\n400 baz\n410 qux\n';
            assertStreamEquals(stream, expected, done);
        });
    });

    it('should cat all log files when no resume point is given', function (done) {
        log.stream(fixtures, function (err, stream) {
            assert.ifError(err);
            var expected = '100 foo\n110 bar\n200 baz\n210 qux\n' +
                '300 foo\n310 bar\n400 baz\n410 qux\n';
            assertStreamEquals(stream, expected, done);
        });
    });

    it('should handle empty logs and empty archived logs', function (done) {
        log.stream(empty, function (err, stream) {
            assert.ifError(err);
            assertStreamEquals(stream, '100 foo\n', done);
        });
    });

    it('should fail if the first log starts after the resume point', function (done) {
        log.stream(fixtures, -10, function (err) {
            assert(err, 'Expected an error');
            done();
        });
    });

    it('should fail if the log can\'t be found', function (done) {
        log.stream(path.join(__dirname, 'foo', 'foobar.log'), function (err) {
            assert(err, 'Expected an error');
            done();
        });
    });

});

