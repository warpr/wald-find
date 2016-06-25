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
        define (['require', 'n3', './namespace'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
} (function (require) {
    const N3 = require ('n3');
    const namespace = require ('./namespace');
    const rdf = namespace.namespaces.rdf;

    class Query {
        constructor (datastore) {
            console.assert (datastore instanceof N3.Store,
                           'ERROR: Query expected an N3.Store instance');
            this.store = datastore;
        }

        first (subject, predicate, object) {
            var results = this.store.find (subject, predicate, object);
            return results.length > 0 ? results[0] : rdf.nil;
        }

        firstSubject (predicate, object) {
            var results = this.store.find (null, predicate, object);
            return results.length > 0 ? results[0].subject : rdf.nil;
        }

        firstObject (subject, predicate) {
            var results = this.store.find (subject, predicate, null);
            return results.length > 0 ? results[0].object : rdf.nil;
        }

        all (subject, predicate, object) {
            return this.store.find (subject, predicate, object);
        }

        allSubjects (predicate, object) {
            return this.store.find (null, predicate, object).map ((result) => result.subject);
        }

        allObjects (subject, predicate) {
            return this.store.find (subject, predicate, null).map ((result) => result.object);
        }

        allPredicatesObjects (subject) {
            var ret = {}
            this.store.find (subject, null, null).map ((result) => {
                if (!ret.hasOwnProperty (result.predicate)) {
                    ret[result.predicate] = [];
                }

                ret[result.predicate].push (result.object);
            });
            return ret;
        }

        list (subject, max) {
            max = max ? max : 256;
            let node = subject;
            let items = [];

            while (node != rdf.nil) {
                items.push (this.firstObject (node, rdf.first));
                node = this.firstObject (node, rdf.rest);
                if (items.length > max) {
                    break;
                }
            }

            return items;
        }
    }

    const factory = function (datastore) {
        return new Query (datastore);
    };

    return {
        factory: factory,
        Query: Query
    };
}));


