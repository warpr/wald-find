/**
 *   This file is part of wald:find - a library for querying RDF.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

'use strict';

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define (['require'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
} (function (require) {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        Proxy = require ('harmony-proxy');
    }

    return Proxy;
}));
