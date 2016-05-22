/**
 *   This file is part of wald:grid.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.0.  See LICENSE.txt.
 */

'use strict';

import {assert} from 'chai';
import Proxy from '../proxy';
import namespace from '../namespace';

/*
var fs = require ('fs');
var package_json = JSON.parse(fs.readFileSync (__dirname + '/../package.json'));
*/

suite ('wald', function () {
    // test ('version', function () {
    //     assert.equal (package_json.version, '0.0.1');
    // });

    suite ('prerequisites', function () {
        test ('Proxy', function () {
            assert.notEqual(typeof Proxy, 'undefined');

            var p = new Proxy({}, { get: function (target, name) { return 23; } });

            assert.equal (p.doesNotExist, 23);
        });
    });

    suite ('wêr', function () {
        suite ('namespaces', function () {
            test ('common terms', function () {
                const ns = namespace.namespaces;

                assert.equal (namespace.a, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                assert.equal (ns.rdf.type, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                assert.equal (ns.owl.sameAs, 'http://www.w3.org/2002/07/owl#sameAs');
                assert.equal (ns.rdfs.comment, 'http://www.w3.org/2000/01/rdf-schema#comment');
                assert.equal (ns.xsd.string, 'http://www.w3.org/2001/XMLSchema#string');
                assert.equal (ns.dc.title, 'http://purl.org/dc/terms/title');

            });

            test ('prefix', function () {
                var aap_terms = [ 'noot', 'mies' ];

                var aap = namespace.prefix('aap', 'https://example.org/aap/', aap_terms);

                assert.equal (aap.noot, 'https://example.org/aap/noot');
                assert.equal (aap.mies, 'https://example.org/aap/mies');
                assert.equal (aap.wim, 'https://example.org/aap/wim');

                assert.equal ('noot' in aap, true);
                assert.equal ('mies' in aap, true);
                assert.equal ('wim' in aap, false);
            });

            test ('qname', function () {
                assert.equal (
                    namespace.qname('http://www.w3.org/2002/07/owl#sameAs'),
                    'owl:sameAs'
                );
                assert.equal (
                    namespace.qname('http://purl.org/dc/terms/title'),
                    'dc:title'
                );
                assert.equal (
                    namespace.qname('https://example.com/does/not/exist'),
                    'https://example.com/does/not/exist'
                );
            });

            test ('shortenKeys', function () {
                const data = {
                    'http://www.w3.org/2002/07/owl#sameAs': 'sameAs goes here',
                    'http://purl.org/dc/terms/title': 'dublin core title',
                    'https://example.com/bogus': 'bogus key',
                }

                const result = namespace.shortenKeys(data);

                assert.deepEqual({
                    'owl:sameAs': 'sameAs goes here',
                    'dc:title': 'dublin core title',
                    'https://example.com/bogus': 'bogus key'
                }, result);
            });
        });
    });
});
