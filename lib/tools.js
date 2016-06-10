/**
 *   This file is part of wald:view.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.0.  See LICENSE.txt.
 */

'use strict';

const NODE_JS = typeof process !== 'undefined' && process.versions && process.versions.node;

(function (factory) {
    const imports = [
        'require',
        'httpinvoke',
        'n3',
        'underscore.string',
        'when',
    ];

    if (typeof define === 'function' && define.amd) {
        define(imports, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require);
    } else {
        console.log('Module system not recognized, please use AMD or CommonJS');
    }
}(function (require) {
    const _s = require ('underscore.string');
    const httpinvoke = require ('httpinvoke');
    const N3 = require ('n3');
    const when = require('when');

    // FIXME: provide a more generic mechanism for NProgress, consider using ReactiveX.
    function streamTurtle (data) {
        const chunkSize = 1024 * 1024;
        const dataSize = data.length;
        const delay = 50;
        const parser = new N3.Parser();
        const useNprogress = typeof window !== 'undefined' && window.NProgress !== undefined;

        let offset = 0;

        if (useNprogress) {
            window.NProgress.start();
        }

        const nextChunk = function () {
            if (offset < dataSize) {
                if (useNprogress) {
                    window.NProgress.set(offset / dataSize);
                }
                parser.addChunk(data.slice(offset, chunkSize + offset));
                offset += chunkSize;
                setTimeout (nextChunk, delay);
            } else {
                parser.end();
                if (useNprogress) {
                    window.NProgress.done();
                }
            }
        }

        setTimeout(function () {
            nextChunk();
        }, delay);

        return parser;
    }

    function parseTurtle (input, datastore) {
        const deferred = when.defer ();
        const parser = streamTurtle(input);

        if (!datastore) {
            datastore = new N3.Store();
        }

        parser.parse (function (err, triple, prefixes) {
            if (err) {
                deferred.reject (err);
            } else if (triple) {
                datastore.addTriple(triple);
            } else {
                datastore.addPrefixes(prefixes);
                deferred.resolve(datastore);
            }
        });

        return deferred.promise;
    }

    function loadTurtle (iri, datastore) {
        if (NODE_JS) {
            const _iri = _s(iri);
            if (_iri.startsWith('http://') || _iri.startsWith('http://')) {
                // remote iri, fall through
            } else if (_iri.startsWith('/')) {
                // local absolute path
                const fs = require ('fs');
                const input = fs.readFileSync (iri);
                return parseTurtle (input, datastore);
            } else {
                // local relative path
                const fs = require ('fs');
                const input = fs.readFileSync (__dirname + '/' + iri);
                return parseTurtle (input, datastore);
            }
        }

        return when (httpinvoke (iri, 'GET')).then (function (data) {
            return parseTurtle (data.body, datastore);
        });
    }

    return {
        parseTurtle: parseTurtle,
        loadTurtle: loadTurtle,
    }
}));

// var LDF = require('./ldf');
// var httpinvoke = require('httpinvoke/httpinvoke-browser');
// var jsonld_module = require('jsonld');

// var jsonld = jsonld_module.promises;




// var parseJsonLD = function (input, datastore) {
//     var data = JSON.parse(input);

//     var options = { format: 'application/nquads' };
//     return jsonld.toRDF (data, options).then(function (dataset) {
//         return parseTurtle(dataset, datastore);
//     });
// };

// var loadFragments = function (server, subject, datastore) {
//     var ldf = new LDF(server, datastore);

//     return ldf.query({ subject: subject });
// };

// var loadJsonLD = function (iri, datastore) {
//     if (!datastore) {
//         datastore = new N3.Store();
//     }

//     if (typeof iri === 'string') {
//         return when(httpinvoke(iri, 'GET')).then(function (data) {
//             return parseJsonLD(data.body, datastore);
//         });
//     } else if (typeof iri === 'object' && iri instanceof HTMLElement) {
//         // iri is an embedded <script type="application/ld+json"> block.
//         return parseJsonLD(iri.textContent, datastore);
//     } else {
//         when.error('unsupported iri type in loadJsonLD, expected HTMLElement or string');
//     }
// };

// exports.loadFragments = loadFragments;
// exports.loadTurtle = loadTurtle;
// exports.loadJsonLD = loadJsonLD;

// // -*- mode: web -*-
// // -*- engine: jsx -*-
