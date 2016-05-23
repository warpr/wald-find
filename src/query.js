/**
 *   This file is part of wald:view.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.0.  See LICENSE.txt.
 */

'use strict';

import N3 from 'n3';
import namespace from './namespace';
// const namespace = require('./namespace');

const rdf = namespace.namespaces.rdf;

class Query {
    constructor (datastore) {
        console.assert(datastore instanceof N3.Store,
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
            return this.store.find (null, predicate, object).map((result) => result.subject);
        }

        allObjects (subject, predicate) {
            return this.store.find (subject, predicate, null).map((result) => result.object);
        }

        allPredicatesObjects (subject) {
            var ret = {}
            this.store.find (subject, null, null).map((result) => {
                if (!ret.hasOwnProperty(result.predicate)) {
                    ret[result.predicate] = [];
                }

                ret[result.predicate].push(result.object);
            });
            return ret;
        }

        firstValues (obj) {
            var ret = {};
            for (var p in obj) {
                if (obj.hasOwnProperty(p) && obj[p].length > 0) {
                    ret[p] = obj[p][0];
                } else {
                    ret[p] = obj[p];
                }
            }

            return ret;
        }
}

const factory = function (datastore) {
    return new Query (datastore);
};

module.exports = {
    factory: factory,
};

// -*- mode: web -*-
// -*- engine: jsx -*-
