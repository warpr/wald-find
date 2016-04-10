/**
 * es6 module loading tests
 * Copyright 2016  Kuno Woudt <kuno@frob.nl>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of copyleft-next 0.3.0.  See
 * [copyleft-next-0.3.0.txt](copyleft-next-0.3.0.txt).
 */

'use strict';

var leftpad = require('left-pad');

exports.name16 = function (name) {
    return leftpad(name, 16);
};

