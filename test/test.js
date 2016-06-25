/**
 *   This file is part of wald:grid.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

'use strict';

(function (factory) {
    const imports = [
        'require',
        'chai',
        'httpinvoke',
        'n3',
        'underscore',
        'when',
        '../lib/proxy',
        '../lib/wer',
        './test-data',
    ];

    if (typeof define === 'function' && define.amd) {
        define (imports, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
} (function (require) {
    const assert = require ('chai').assert;
    const httpinvoke = require ('httpinvoke');
    const N3 = require ('n3');
    const Proxy = require ('../lib/proxy');
    const testData = require ('./test-data');
    const underscore = require ('underscore');
    const when = require ('when');
    const wêr = require ('../lib/wer');

    const REMOTE_TESTS = false;

    // FIXME: should be a utility function somewhere
    function loadTestData (key) {
        const turtle = testData[key];
        const parser = N3.Parser ();
        const store = N3.Store ();
        const deferred = when.defer ();

        parser.parse (
            turtle,
            function (error, triple, prefixes) {
                if (triple) {
                    store.addTriple (triple.subject, triple.predicate, triple.object);
                }
                else
                {
                    deferred.resolve ({
                        prefixes: wêr.loadPrefixes (prefixes),
                        store: store,
                    });
                }
            }
        );

        return deferred.promise;
    }

    function loadCopyleftNext () {
        return loadTestData ('copyleft-next-0.3.0.ttl');
    }

    function loadLicenseForm () {
        return loadTestData ('license-form.ttl');
    }

    suite ('prerequisites', function () {
        test ('Proxy', function () {
            assert.notEqual (typeof Proxy, 'undefined');

            var p = new Proxy ({}, { get: function (target, name) { return 23; } });

            assert.equal (p.doesNotExist, 23);
        });

        if (REMOTE_TESTS) {
            test ('httpinvoke', function (done) {
                return when (httpinvoke ('http://httpstat.us/200', 'GET'))
                    .then (function (data) {
                        assert.equal (data.statusCode, 200);
                        assert.equal (data.body, '200 OK');
                        done ();
                    });
            });
        } else {
            test ('httpinvoke SKIPPED', function () {});
        }
    });

    suite ('wêr', function () {
    //     // test ('version', function () {
    //     //     assert.equal (package_json.version, '0.0.1');
    //     // });

        suite ('namespaces', function () {
            test ('common terms', function () {
                const ns = wêr.namespaces;

                assert.equal (wêr.a, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                assert.equal (ns.rdf.type, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                assert.equal (ns.owl.sameAs, 'http://www.w3.org/2002/07/owl#sameAs');
                assert.equal (ns.rdfs.comment, 'http://www.w3.org/2000/01/rdf-schema#comment');
                assert.equal (ns.xsd.string, 'http://www.w3.org/2001/XMLSchema#string');
                assert.equal (ns.dc.title, 'http://purl.org/dc/terms/title');
            });

            test ('prefix', function () {
                var aap_terms = [ 'noot', 'mies' ];

                var aap = wêr.prefix ('aap', 'https://example.org/aap/', aap_terms);

                assert.equal (aap.noot, 'https://example.org/aap/noot');
                assert.equal (aap.mies, 'https://example.org/aap/mies');
                assert.equal (aap.wim, 'https://example.org/aap/wim');

                assert.equal ('noot' in aap, true);
                assert.equal ('mies' in aap, true);
                assert.equal ('wim' in aap, false);
            });

            test ('qname', function () {
                assert.equal (
                    wêr.qname ('http://www.w3.org/2002/07/owl#sameAs'),
                    'owl:sameAs'
                );
                assert.equal (
                    wêr.qname ('http://purl.org/dc/terms/title'),
                    'dc:title'
                );
                assert.equal (
                    wêr.qname ('https://example.com/does/not/exist'),
                    'https://example.com/does/not/exist'
                );
            });

            test ('shortenKeys', function () {
                const data = {
                    'http://www.w3.org/2002/07/owl#sameAs': 'sameAs goes here',
                    'http://purl.org/dc/terms/title': 'dublin core title',
                    'https://example.com/bogus': 'bogus key',
                }

                const result = wêr.shortenKeys (data);

                assert.deepEqual ({
                    'owl:sameAs': 'sameAs goes here',
                    'dc:title': 'dublin core title',
                    'https://example.com/bogus': 'bogus key'
                }, result);
            });
        });

        suite ('query', function () {
            test ('first', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const w = wêr.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const dc = wêr.namespaces.dc;

                    let triple = w.first (null, dc.title, null);

                    assert.equal (triple.subject, id);
                    assert.equal (triple.predicate, dc.title);
                    assert.equal (triple.object, N3.Util.createLiteral ('copyleft-next'));

                    triple = w.first (id, dc.title);

                    assert.equal (triple.subject, id);
                    assert.equal (triple.predicate, dc.title);
                    assert.equal (triple.object, N3.Util.createLiteral ('copyleft-next'));

                    done ();
                }, done);
            });

            test ('firstSubject', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const w = wêr.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const dc = wêr.namespaces.dc;

                    let subject = w.firstSubject (dc.title);
                    assert.equal (subject, id);

                    subject = w.firstSubject (
                        dc.title, N3.Util.createLiteral ('copyleft-next'));
                    assert.equal (subject, id);

                    done ();
                }, done);
            });

            test ('firstObject', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const w = wêr.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const dc = wêr.namespaces.dc;

                    let obj = w.firstObject (null, dc.title);
                    assert.equal (obj, N3.Util.createLiteral ('copyleft-next'));

                    obj = w.firstObject (id, dc.title);
                    assert.equal (obj, N3.Util.createLiteral ('copyleft-next'));

                    done ();
                }, done);
            });

            test ('all', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const w = wêr.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const cc = wêr.namespaces.cc;

                    const triples = w.all (id, cc.permits);
                    assert.equal (triples.length, 3);

                    const sorted = underscore (triples).sortBy ('object');
                    assert.equal (sorted[0].object, cc.DerivativeWorks);
                    assert.equal (sorted[1].object, cc.Distribution);
                    assert.equal (sorted[2].object, cc.Reproduction);

                    done ();
                }, done);
            });

            test ('allSubjects', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const w = wêr.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const cc = wêr.namespaces.cc;

                    const subjects = w.allSubjects (wêr.a, cc.License);
                    assert.equal (subjects.length, 1);

                    assert.equal (subjects[0], id);

                    done ();
                }, done);
            });

            test ('allObjects', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const w = wêr.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const cc = wêr.namespaces.cc;

                    const objs = w.allObjects (id, cc.permits);
                    assert.equal (objs.length, 3);

                    objs.sort ();
                    assert.equal (objs[0], cc.DerivativeWorks);
                    assert.equal (objs[1], cc.Distribution);
                    assert.equal (objs[2], cc.Reproduction);

                    done ();
                }, done);
            });

            test ('allPredicatesObjects', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const prefixes = result.prefixes;
                    const w = wêr.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const dc = prefixes.dc;
                    const li = prefixes.li;


                    let model = w.allPredicatesObjects (id);
                    assert.equal (underscore (model).keys ().length, 12);

                    assert.equal (model[dc.hasVersion][0], '"0.3.0"');
                    assert.equal (model[dc.identifier][0], '"copyleft-next"');
                    assert.equal (model[li.name][0], '"copyleft-next 0.3.0"');

                    model = wêr.shortenKeys (model);

                    assert.equal (model['dc:hasVersion'][0], '"0.3.0"');
                    assert.equal (model['dc:identifier'][0], '"copyleft-next"');
                    assert.equal (model['li:name'][0], '"copyleft-next 0.3.0"');

                    done ();
                }, done);
            });

            test ('firstValues', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const prefixes = result.prefixes;
                    const w = wêr.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const dc = prefixes.dc;
                    const li = prefixes.li;

                    let model = w.allPredicatesObjects (id);
                    assert.equal (underscore (model).keys ().length, 12);

                    model = wêr.firstValues (model);

                    assert.equal (model[dc.hasVersion], '"0.3.0"');
                    assert.equal (model[dc.identifier], '"copyleft-next"');
                    assert.equal (model[li.name], '"copyleft-next 0.3.0"');

                    model = wêr.shortenKeys (model);

                    assert.equal (model['dc:hasVersion'], '"0.3.0"');
                    assert.equal (model['dc:identifier'], '"copyleft-next"');
                    assert.equal (model['li:name'], '"copyleft-next 0.3.0"');

                    done ();
                }, done);
            });

            test ('list', function (done) {
                loadLicenseForm ().then (function (result) {
                    const store = result.store;
                    const prefixes = result.prefixes;
                    const w = wêr.factory (store);
                    const formId = 'https://example.org/license-form.ttl';

                    const dc = prefixes.dc;
                    const foaf = prefixes.foaf;
                    const li = prefixes.li;
                    const rdf = prefixes.rdf;
                    const wm = prefixes.wm;

                    const list = w.firstObject (formId, wm.fields);
                    const head = w.allPredicatesObjects (list);

                    assert.property (head, rdf.first);
                    assert.property (head, rdf.rest);

                    const items = w.list (list);

                    assert.equal (items.length, 5);
                    assert.equal (w.firstObject (items[0], wm.predicate), li.id);
                    assert.equal (w.firstObject (items[1], wm.predicate), dc.title);
                    assert.equal (w.firstObject (items[2], wm.predicate), dc.hasVersion);
                    assert.equal (w.firstObject (items[3], wm.predicate), foaf.logo);
                    assert.equal (w.firstObject (items[4], wm.predicate), dc.subject);

                    done ();
                }, done);
            });
        });

        suite ('tools', function () {

            test ('integer', function () {
                const twentyone = wêr.tools.integer ('"21"');
                assert.equal (twentyone, 21);

                const twentytwo = wêr.tools.integer ('"22.9"');
                assert.equal (twentytwo, 22);

                const twentythree = wêr.tools.integer (
                    '"23"^^http://www.w3.org/2001/XMLSchema#integer');
                assert.equal (twentythree, 23);

                const twentyfour = wêr.tools.integer ('"Twenty-four"@en-gb');
                assert.equal (twentyfour, null);

                const twentyfive = wêr.tools.integer ('https://example.com/25');
                assert.equal (twentyfive, null);

                const twentysix = wêr.tools.integer ('_:b26');
                assert.equal (twentysix, null);

                const twentyseven = wêr.tools.integer (
                    '"27"^^http://www.w3.org/2001/XMLSchema#int');
                assert.equal (twentyseven, 27);

                const twentyeight = wêr.tools.integer (
                    '"28"^^http://www.w3.org/2001/XMLSchema#long');
                assert.equal (twentyeight, 28);

                const twentynine = wêr.tools.integer (
                    '"29.9"^^http://www.w3.org/2001/XMLSchema#float');
                assert.equal (twentynine, 29);

                const thirty = wêr.tools.integer ('"0x30"');
                assert.equal (thirty, 0); // actually we don't support hex notation, so 0

                const thirtyone = wêr.tools.integer ('"031"');
                assert.equal (thirtyone, 31);
            });

            if (REMOTE_TESTS) {
                test ('loadFragments', function (done) {
                    const server = 'https://licensedb.org/data/licensedb';
                    const subject = 'https://licensedb.org/id/copyleft-next-0.3.0';

                    return wêr.tools.loadFragments (server, subject)
                        .then (function (datastore) {
                            const ids = datastore.find (
                                'https://licensedb.org/id/copyleft-next-0.3.0',
                                'http://purl.org/dc/terms/identifier',
                                null
                            );

                            assert.equal (ids[0].object, '"copyleft-next"');
                            done ();
                        });
                });
            } else {
                test ('loadFragments SKIPPED', function () {});
            }

            test ('loadTurtle', function (done) {
                const turtlePath = '../test/data/copyleft-next-0.3.0.ttl';

                return wêr.tools.loadTurtle (turtlePath).then (function (datastore) {
                    const ids = datastore.find (
                        'https://licensedb.org/id/copyleft-next-0.3.0',
                        'http://purl.org/dc/terms/identifier',
                        null
                    );

                    assert.equal (ids[0].object, '"copyleft-next"');
                    done ();
                });
            });

            test ('loadJsonLD', function (done) {
                const jsonldPath = '../test/data/copyleft-next-0.3.0.jsonld';

                return wêr.tools.loadJsonLD (jsonldPath).then (function (datastore) {
                    const ids = datastore.find (
                        'https://licensedb.org/id/copyleft-next-0.3.0',
                        'http://purl.org/dc/terms/identifier',
                        null
                    );

                    assert.equal (ids[0].object, '"copyleft-next"');
                    done ();
                });
            });
        });
    });
}));

// -*- mode: javascript-mode -*-
