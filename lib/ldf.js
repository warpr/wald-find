/**
 *   This file is part of wald:view.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.0.  See LICENSE.txt.
 */

'use strict';

(function (factory) {
    const imports = [
        'require',
        'httpinvoke',
        'n3',
        'urijs',
        'when',
    ];

    if (typeof define === 'function' && define.amd) {
        define (imports, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
}(function (require) {
    const httpinvoke = require ('httpinvoke');
    const N3 = require ('n3');
    const URIjs = require ('urijs');
    const when = require ('when');

    function getRequest (url) {
        return httpinvoke(url, 'GET', {
            headers: {
                Accept: 'application/trig'
            }
        }).then (function (data) {
            return data.body;
        });
    }

    function LDF (connection, datastore) {
        this._server = connection;

        if (!datastore) {
            this._datastore = new N3.Store();
        } else {
            this._datastore = datastore;
        }
    }

    LDF.prototype.page = function (url) {
        var self = this;
        var parser = new N3.Parser({ format: 'application/trig' });
        var nextPage = null;

        return getRequest (url).then (function (body) {
            var deferred = when.defer();

            parser.parse (body, function (parserError, triple, prefixes) {
                if (parserError != null) {
                    return deferred.reject (parserError);
                }

                if (!triple) {
                    self._datastore.addPrefixes(prefixes);
                    return deferred.resolve (nextPage ? self.page (nextPage) : self._datastore);
                }

                if (triple.graph === '') {
                    self._datastore.addTriple(triple);
                } else if (triple.predicate === 'http://www.w3.org/ns/hydra/core#nextPage') {
                    nextPage = triple.object;
                }
            });

            return deferred.promise;
        });
    };

    LDF.prototype.query = function (pattern) {
        var url = new URIjs(this._server);
        url.addQuery(pattern);

        return this.page (url.toString());
    };

    return LDF;
}));

// // -*- mode: javascript -*-
