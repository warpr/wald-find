/**
 *   This file is part of wald:grid.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.0.  See LICENSE.txt.
 */

'use strict';

import {assert} from 'chai';
import example from '../example';
import Proxy from '../proxy';

/*
var assert = null;
var example = require('../lib/example.js');

if (typeof require === 'function') {
    assert = require ('chai').assert;
} else {
    assert = chai.assert;
}
*/
/*
var fs = require ('fs');
var package_json = JSON.parse(fs.readFileSync (__dirname + '/../package.json'));
*/

suite ('suite', function () {
    // test ('version', function () {
    //     assert.equal (package_json.version, '0.0.1');
    // });

    test ('math', function () {
        assert.equal(5, 2+3);
        assert.equal(6, 2*3);
    });

    test ('module', function () {
        assert.equal(example.name16('kuno'), '            kuno');
    });

    test ('Proxy', function () {
        assert.notEqual(typeof Proxy, 'undefined');

        var p = new Proxy({}, { get: function (target, name) { return 23; } });

        assert.equal (p.doesNotExist, 23);
    });
});
