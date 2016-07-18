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
        'chai',
        'httpinvoke',
        'n3',
        'underscore',
        'when',
        '../lib/proxy',
        '../lib/find',
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
    const find = require ('../lib/find');

    const a = find.a;
    const cc = find.namespaces.cc;
    const dc = find.namespaces.dc;
    const foaf = find.namespaces.foaf;
    const owl = find.namespaces.owl;
    const rdf = find.namespaces.rdf;
    const rdfs = find.namespaces.rdfs;
    const schema = find.namespaces.schema;
    const sioc = find.namespaces.sioc;
    const xsd = find.namespaces.xsd;

    let REMOTE_TESTS = false;

    if (typeof process !== 'undefined' && process.env.WALD_FIND_REMOTE_TESTS) {
        REMOTE_TESTS = true;
    }

    if (typeof window !== 'undefined' && window.location) {
        if (new RegExp ('WALD_FIND_REMOTE_TESTS').test (window.location.search)) {
            REMOTE_TESTS = true;
        }
    }

    // FIXME: should be a utility function somewhere
    function loadTestData (key) {
        const turtle = testData[key];
        const parser = new N3.Parser ();
        const store = new N3.Store ();
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
                        prefixes: find.loadPrefixes (prefixes),
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

    suite ('find', function () {
        suite ('namespaces', function () {
            test ('common terms', function () {
                assert.equal (a, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                assert.equal (rdf.type, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                assert.equal (owl.sameAs, 'http://www.w3.org/2002/07/owl#sameAs');
                assert.equal (rdfs.comment, 'http://www.w3.org/2000/01/rdf-schema#comment');
                assert.equal (xsd.string, 'http://www.w3.org/2001/XMLSchema#string');
                assert.equal (dc.title, 'http://purl.org/dc/terms/title');
            });

            test ('prefix', function () {
                var aap_terms = [ 'noot', 'mies' ];

                var aap = find.prefix ('aap', 'https://example.org/aap/', aap_terms);

                assert.equal (aap.noot, 'https://example.org/aap/noot');
                assert.equal (aap.mies, 'https://example.org/aap/mies');
                assert.equal (aap.wim, 'https://example.org/aap/wim');

                assert.equal ('noot' in aap, true);
                assert.equal ('mies' in aap, true);
                assert.equal ('wim' in aap, false);
            });

            test ('qname', function () {
                assert.equal (
                    find.qname ('http://www.w3.org/2002/07/owl#sameAs'),
                    'owl:sameAs'
                );
                assert.equal (
                    find.qname ('http://purl.org/dc/terms/title'),
                    'dc:title'
                );
                assert.equal (
                    find.qname ('https://example.com/does/not/exist'),
                    'https://example.com/does/not/exist'
                );
            });

            test ('shortenKeys', function () {
                const data = {
                    'http://www.w3.org/2002/07/owl#sameAs': 'sameAs goes here',
                    'http://purl.org/dc/terms/title': 'dublin core title',
                    'https://example.com/bogus': 'bogus key',
                }

                const result = find.shortenKeys (data);

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
                    const w = find.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';

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
                    const w = find.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';

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
                    const w = find.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';

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
                    const w = find.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';

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
                    const w = find.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';

                    const subjects = w.allSubjects (find.a, cc.License);
                    assert.equal (subjects.length, 1);

                    assert.equal (subjects[0], id);

                    done ();
                }, done);
            });

            test ('allObjects', function (done) {
                loadCopyleftNext ().then (function (result) {
                    const store = result.store;
                    const w = find.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';

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
                    const w = find.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const dc = prefixes.dc;
                    const li = prefixes.li;


                    let model = w.allPredicatesObjects (id);
                    assert.equal (underscore (model).keys ().length, 12);

                    assert.equal (model[dc.hasVersion][0], '"0.3.0"');
                    assert.equal (model[dc.identifier][0], '"copyleft-next"');
                    assert.equal (model[li.name][0], '"copyleft-next 0.3.0"');

                    model = find.shortenKeys (model);

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
                    const w = find.factory (store);

                    const id = 'https://licensedb.org/id/copyleft-next-0.3.0';
                    const dc = prefixes.dc;
                    const li = prefixes.li;

                    let model = w.allPredicatesObjects (id);
                    assert.equal (underscore (model).keys ().length, 12);

                    model = find.firstValues (model);

                    assert.equal (model[dc.hasVersion], '"0.3.0"');
                    assert.equal (model[dc.identifier], '"copyleft-next"');
                    assert.equal (model[li.name], '"copyleft-next 0.3.0"');

                    model = find.shortenKeys (model);

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
                    const w = find.factory (store);
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
                const twentyone = find.tools.integer ('"21"');
                assert.equal (twentyone, 21);

                const twentytwo = find.tools.integer ('"22.9"');
                assert.equal (twentytwo, 22);

                const twentythree = find.tools.integer (
                    '"23"^^http://www.w3.org/2001/XMLSchema#integer');
                assert.equal (twentythree, 23);

                const twentyfour = find.tools.integer ('"Twenty-four"@en-gb');
                assert.equal (twentyfour, null);

                const twentyfive = find.tools.integer ('https://example.com/25');
                assert.equal (twentyfive, null);

                const twentysix = find.tools.integer ('_:b26');
                assert.equal (twentysix, null);

                const twentyseven = find.tools.integer (
                    '"27"^^http://www.w3.org/2001/XMLSchema#int');
                assert.equal (twentyseven, 27);

                const twentyeight = find.tools.integer (
                    '"28"^^http://www.w3.org/2001/XMLSchema#long');
                assert.equal (twentyeight, 28);

                const twentynine = find.tools.integer (
                    '"29.9"^^http://www.w3.org/2001/XMLSchema#float');
                assert.equal (twentynine, 29);

                const thirty = find.tools.integer ('"0x30"');
                assert.equal (thirty, 0); // actually we don't support hex notation, so 0

                const thirtyone = find.tools.integer ('"031"');
                assert.equal (thirtyone, 31);
            });

            if (REMOTE_TESTS) {
                test ('loadFragments', function (done) {
                    const server = 'https://licensedb.org/data/licensedb';
                    const subject = 'https://licensedb.org/id/copyleft-next-0.3.0';

                    return find.tools.loadFragments (server, subject)
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

                return find.tools.loadTurtle (turtlePath).then (function (datastore) {
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

                return find.tools.loadJsonLD (jsonldPath).then (function (datastore) {
                    const ids = datastore.find (
                        'https://licensedb.org/id/copyleft-next-0.3.0',
                        'http://purl.org/dc/terms/identifier',
                        null
                    );

                    assert.equal (ids[0].object, '"copyleft-next"');
                    done ();
                });
            });

            test ('sortQuads', function () {
                const triples = [
                    {subject: 'https://b.nl/200', predicate: rdf.subject, object: '_:b100'},
                    {subject: 'https://b.nl/200', predicate: a, object: rdf.Statement},
                    {subject: '_:b100', predicate: foaf.name, object: '倖田來未'},
                    {subject: '_:b100', predicate: foaf.name, object: 'Koda Kumi'},
                ];

                const sorted = find.tools.sortQuads (triples);

                assert.equal ('_:b100', sorted[0].subject);
                assert.equal ('_:b100', sorted[1].subject);
                assert.equal (foaf.name, sorted[0].predicate);
                assert.equal (foaf.name, sorted[1].predicate);
                assert.equal ('Koda Kumi', sorted[0].object);
                assert.equal ('倖田來未', sorted[1].object);

                assert.equal ('https://b.nl/200', sorted[3].subject);
                assert.equal (rdf.type, sorted[3].predicate);
                assert.equal (rdf.Statement, sorted[3].object);
            });

            test ('storeFromArray (array of arrays)', function () {
                const triples = [
                    ['_:b100', a, schema.MusicGroup],
                    ['_:b100', foaf.name, '倖田來未'],
                    ['https://b.nl/200', a, rdf.Statement],
                    ['https://b.nl/200', rdf.subject, '_:b100']
                ];

                const store = find.tools.storeFromArray (triples);

                assert.isOk (store instanceof N3.Store);
                assert.equal (4, store.find (null, null, null, null).length);
            });

            test ('storeFromArray (array of objects)', function () {
                const triples = [
                    {subject: 'https://b.nl/200', predicate: rdf.subject, object: '_:b100'},
                    {subject: 'https://b.nl/200', predicate: a, object: rdf.Statement},
                    {subject: '_:b100', predicate: foaf.name, object: '倖田來未'},
                    {subject: '_:b100', predicate: a, object: schema.MusicGroup},
                ];

                const store = find.tools.storeFromArray (triples);

                assert.isOk (store instanceof N3.Store);

                const results = find.tools.sortQuads (store.find (null, null, null, null));
                assert.equal (4, results.length);

                assert.deepEqual ({
                    subject: '_:b100', predicate: a, object: schema.MusicGroup, graph: ''
                }, results[0]);

                assert.deepEqual ({
                    subject: '_:b100', predicate: foaf.name, object: '倖田來未', graph: ''
                }, results[1]);

                assert.deepEqual ({
                    subject: 'https://b.nl/200', predicate: rdf.subject, object: '_:b100',
                    graph: ''
                }, results[2]);

                assert.deepEqual ({
                    subject: 'https://b.nl/200', predicate: rdf.type, object: rdf.Statement,
                    graph: ''
                }, results[3]);
            });

            test ('dereify', function () {
                const triples = [
                    ['_:addName', a, rdf.Statement],
                    ['_:addName', rdf.subject, '_:kodakumi'],
                    ['_:addName', rdf.predicate, foaf.name],
                    ['_:addName', rdf.object, '倖田來未'],
                    ['_:addTwitter', a, rdf.Statement],
                    ['_:addTwitter', rdf.subject, '_:kodakumi'],
                    ['_:addTwitter', rdf.predicate, sioc.Microblog],
                    ['_:addTwitter', rdf.object, 'https://twitter.com/kodakuminet'],
                ];

                const results = find.tools.sortQuads (find.tools.dereify (triples));
                assert.equal (2, results.length);

                assert.deepEqual ({
                    subject: '_:kodakumi', predicate: sioc.Microblog,
                    object: 'https://twitter.com/kodakuminet', graph: ''
                }, results[0]);

                assert.deepEqual ({
                    subject: '_:kodakumi', predicate: foaf.name,
                    object: '倖田來未', graph: ''
                }, results[1]);
            });

            test ('replaceId', function () {
                const store = new N3.Store ();

                const mbid = 'http://musicbrainz.org/artist/'
                    + '455641ea-fff4-49f6-8fb4-49f961d8f1ac';

                store.addTriple ('_:b100', a, schema.MusicGroup);
                store.addTriple (mbid, owl.sameAs, '_:b100');
                store.addTriple ('_:b100', foaf.name, '倖田來未');
                store.addTriple ('https://b.nl/200', a, rdf.Statement);
                store.addTriple ('https://b.nl/200', rdf.subject, '_:b100');

                const w = find.factory (store);

                // test replacement in predicate position
                find.tools.replaceId (foaf.name, schema.name, store);
                assert.equal (0, w.all ('_:b100', foaf.name, '倖田來未').length);
                assert.equal (1, w.all ('_:b100', schema.name, '倖田來未').length);

                // test replacement in subject and object position
                find.tools.replaceId ('_:b100', 'https://b.nl/100', store);
                find.tools.replaceId ('https://b.nl/200', '_:b200', store);
                assert.equal (0, w.all ('_:b100', foaf.name, '倖田來未').length);
                assert.equal (0, w.all ('_:b100', schema.name, '倖田來未').length);
                assert.equal (1, w.all ('https://b.nl/100', schema.name, '倖田來未').length);

                assert.equal (0, w.all ('https://b.nl/200', rdf.subject, '_:b100').length);
                assert.equal (1, w.all ('_:b200', rdf.subject, 'https://b.nl/100').length);

                assert.equal (0, w.all (mbid, owl.sameAs, '_:b100').length);
                assert.equal (1, w.all (mbid, owl.sameAs, 'https://b.nl/100').length);
            });
        });
    });
}));

// -*- mode: javascript-mode -*-
