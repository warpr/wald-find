/**
 *   This file is part of wald:find - a library for querying RDF.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

'use strict';

(function (factory) {
    const imports = [
        'require',
        'httpinvoke',
        'jsonld',
        'n3',
        'underscore.string',
        'when',
        './ldf',
        './namespace',
        './query',
    ];

    if (typeof define === 'function' && define.amd) {
        define (imports, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
} (function (require) {
    const _s = require ('underscore.string');
    const httpinvoke = require ('httpinvoke');
    const N3 = require ('n3');
    const when = require ('when');
    const jsonld = require ('jsonld').promises;
    const LDF = require ('./ldf');
    const namespace = require ('./namespace');
    const query = require ('./query');

    const NODE_JS = typeof process !== 'undefined' && process.versions && process.versions.node;

    const a = namespace.a;
    const rdf = namespace.namespaces.rdf;
    const rdfs = namespace.namespaces.rdfs;

    function integer (value) {
        if (value === rdfs.nil) {
            return null;
        }

        if (!N3.Util.isLiteral (value)) {
            return null;
        }

        const ret = parseInt (N3.Util.getLiteralValue (value), 10);
        return isNaN (ret) ? null : ret;
    }

    // FIXME: provide a more generic mechanism for NProgress, consider using ReactiveX.
    function streamTurtle (data) {
        const chunkSize = 1024 * 1024;
        const dataSize = data.length;
        const delay = 50;
        const parser = new N3.Parser ();
        const useNprogress = typeof window !== 'undefined' && window.NProgress !== undefined;

        let offset = 0;

        if (useNprogress) {
            window.NProgress.start ();
        }

        const nextChunk = function () {
            if (offset < dataSize) {
                if (useNprogress) {
                    window.NProgress.set (offset / dataSize);
                }
                parser.addChunk (data.slice (offset, chunkSize + offset));
                offset += chunkSize;
                setTimeout (nextChunk, delay);
            } else {
                parser.end ();
                if (useNprogress) {
                    window.NProgress.done ();
                }
            }
        }

        setTimeout (function () {
            nextChunk ();
        }, delay);

        return parser;
    }

    function parseTurtle (input, datastore) {
        const deferred = when.defer ();
        const parser = streamTurtle (input);

        if (!datastore) {
            datastore = new N3.Store ();
        }

        parser.parse (function (err, triple, prefixes) {
            if (err) {
                deferred.reject (err);
            } else if (triple) {
                datastore.addTriple (triple);
            } else {
                datastore.addPrefixes (prefixes);
                deferred.resolve (datastore);
            }
        });

        return deferred.promise;
    }

    function loadFile (iri) {
        if (NODE_JS) {
            const _iri = _s (iri);
            if (_iri.startsWith ('http://') || _iri.startsWith ('http://')) {
                // remote iri, fall through
            } else if (_iri.startsWith ('/')) {
                // local absolute path
                const fs = require ('fs');
                const input = fs.readFileSync (iri);
                return when (input);
            } else {
                // local relative path
                const fs = require ('fs');
                const input = fs.readFileSync (__dirname + '/' + iri);
                return when (input);
            }
        }

        return when (httpinvoke (iri, 'GET')).then (function (data) { return data.body; });
    }

    function loadTurtle (iri, datastore) {
        return loadFile (iri).then (function (data) {
            return parseTurtle (data, datastore);
        });
    }

    function parseJsonLD (input, datastore) {
        var data = JSON.parse (input);

        if (!datastore) {
            datastore = new N3.Store ();
        }

        var options = { format: 'application/nquads' };
        return jsonld.toRDF (data, options).then (function (dataset) {
            return parseTurtle (dataset, datastore);
        });
    }

    function loadJsonLD (iri, datastore) {
        if (typeof iri === 'string') {
            return loadFile (iri).then (function (data) {
                return parseJsonLD (data, datastore);
            });
        } else if (typeof iri === 'object' && iri instanceof HTMLElement) {
            // iri is an embedded <script type="application/ld+json"> block.
            return parseJsonLD (iri.textContent, datastore);
        } else {
            when.error ('unsupported iri type in loadJsonLD, expected HTMLElement or string');
        }
    }

    function loadFragments (server, subject, datastore) {
        var ldf = new LDF (server, datastore);

        return ldf.query ({ subject: subject });
    }

    function replaceId (oldId, newId, datastore) {
        let triples = datastore.find (oldId, null, null, null);

        triples.map ((triple) => {
            datastore.removeTriple (oldId, triple.predicate, triple.object, triple.graph);
            datastore.addTriple (newId, triple.predicate, triple.object, triple.graph);
        });

        triples = datastore.find (null, oldId, null, null);

        triples.map ((triple) => {
            datastore.removeTriple (triple.subject, oldId, triple.object, triple.graph);
            datastore.addTriple (triple.subject, newId, triple.object, triple.graph);
        });

        triples = datastore.find (null, null, oldId, null);

        triples.map ((triple) => {
            datastore.removeTriple (triple.subject, triple.predicate, oldId, triple.graph);
            datastore.addTriple (triple.subject, triple.predicate, newId, triple.graph);
        });

        triples = datastore.find (null, null, null, oldId);

        triples.map ((triple) => {
            datastore.removeTriple (triple.subject, triple.predicate, triple.object, oldId);
            datastore.addTriple (triple.subject, triple.predicate, triple.object, newId);
        });
    }

    function storeFromArray (triples) {
        if (triples instanceof N3.Store) {
            return triples;
        }

        const store = new N3.Store ();

        if (triples.length === 0) {
            return store;
        }

        if (triples[0].subject === undefined) {
            triples.map (t => store.addTriple (t[0], t[1], t[2]));
        } else {
            triples.map (t => store.addTriple (t));
        }

        return store;
    }

    function quadCompare (a, b) {
        const compareTerm = function (key) {
            if (a[key] < b[key]) {
                return -1;
            }
            if (a[key] > b[key]) {
                return 1;
            }

            return 0; // terms must be equal
        };

        let result = compareTerm ('subject');
        if (result !== 0) {
            return result;
        }

        result = compareTerm ('predicate');
        if (result !== 0) {
            return result;
        }

        result = compareTerm ('object');
        if (result !== 0) {
            return result;
        }

        return compareTerm ('graph');
    }

    function sortQuads (quads) {
        return quads.map (quad => {
            if (!quad.graph) {
                quad.graph = '';
            }
            return quad;
        }).sort (quadCompare);
    }

    function dereify (triples) {
        const find = query.factory (storeFromArray (triples));

        return find.allSubjects (a, rdf.Statement).map (subject => {
            return {
                subject: find.firstObject (subject, rdf.subject),
                predicate: find.firstObject (subject, rdf.predicate),
                object: find.firstObject (subject, rdf.object),
            };
        });
    }

    return {
        dereify: dereify,
        integer: integer,
        loadFragments: loadFragments,
        loadJsonLD: loadJsonLD,
        loadTurtle: loadTurtle,
        parseJsonLD: parseJsonLD,
        parseTurtle: parseTurtle,
        replaceId: replaceId,
        sortQuads: sortQuads,
        storeFromArray: storeFromArray,
    }
}));


