/**
 *   This file is part of wald:view.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.0.  See LICENSE.txt.
 */

'use strict';

import _s from 'underscore.string';
import Proxy from './proxy';

/**
 * There are two utilities here to deal with namespaces/prefixes.  The first
 * (class Namespace) provides a way to conveniently use the prefix in sourcecode,
 * e.g. "xsd:string" can be referred to in sourcecode as xsd.string, similarly
 * "rdfs:label" becomes rdfs.label, etc...
 *
 * prefix instead is more flexible (it doesn't require you to specify all terms)
 * and provides more utility functions.  With prefix "xsd:string" and "rdfs:label"
 * need to be expressed as xsd("string") and rdfs("label") respectively.
 *
 * A prefix function made with prefix will have its base url as a "base" property
 * (so xsd.base === "http://www.w3.org/2001/XMLSchema#"), and its preferred
 * prefix as a "prefix" property (so xsd.prefix === "xsd").
 */

class Namespace {
    constructor (prefix, base, terms) {
        this.__$base = base;
        this.__$prefix = prefix;
        if (terms) {
            terms.map ((term) => this[term] = base + term);
        }
    }
    qname (iri) {
        if (_s (iri).startsWith (this.__$base)) {
            return this.__$prefix + ':' + iri.substring (this.__$base.length);
        } else {
            return false;
        }
    }
}

const termLookup = {
    get: function (target, name) {
        return name in target ? target[name] : target.__$base + name;
    }
};

const prefix = function (prefix, base, terms) {
    return new Proxy (new Namespace (prefix, base, terms), termLookup);
};

const owl_terms = [
    'AllDifferent', 'AllDisjointClasses', 'AllDisjointProperties', 'allValuesFrom',
    'annotatedProperty', 'annotatedSource', 'annotatedTarget', 'Annotation',
    'AnnotationProperty', 'assertionProperty', 'AsymmetricProperty', 'Axiom',
    'backwardCompatibleWith', 'bottomDataProperty', 'bottomObjectProperty', 'cardinality',
    'Class', 'complementOf', 'DataRange', 'datatypeComplementOf', 'DatatypeProperty',
    'deprecated', 'DeprecatedClass', 'DeprecatedProperty', 'differentFrom',
    'disjointUnionOf', 'disjointWith', 'distinctMembers', 'equivalentClass',
    'equivalentProperty', 'FunctionalProperty', 'hasKey', 'hasSelf', 'hasValue',
    'imports', 'incompatibleWith', 'intersectionOf', 'InverseFunctionalProperty',
    'inverseOf', 'IrreflexiveProperty', 'maxCardinality', 'maxQualifiedCardinality',
    'members', 'minCardinality', 'minQualifiedCardinality', 'NamedIndividual',
    'NegativePropertyAssertion', 'Nothing', 'ObjectProperty', 'onClass', 'onDataRange',
    'onDatatype', 'oneOf', 'onProperties', 'onProperty', 'Ontology', 'OntologyProperty',
    'priorVersion', 'propertyChainAxiom', 'propertyDisjointWith', 'qualifiedCardinality',
    'ReflexiveProperty', 'Restriction', 'sameAs', 'someValuesFrom', 'sourceIndividual',
    'SymmetricProperty', 'targetIndividual', 'targetValue', 'Thing', 'topDataProperty',
    'topObjectProperty', 'TransitiveProperty', 'unionOf', 'versionInfo', 'versionIRI',
    'withRestrictions',
];

const rdf_terms = [
    'Alt', 'Bag', 'first', 'HTML', 'langString', 'List', 'nil', 'object',
    'PlainLiteral', 'predicate', 'Property', 'rest', 'Seq', 'Statement',
    'subject', 'type', 'value', 'XMLLiteral',
];

const rdfs_terms = [
    'Class', 'comment', 'Container', 'ContainerMembershipProperty', 'Datatype',
    'domain', 'isDefinedBy', 'label', 'Literal', 'member', 'range', 'Resource',
    'seeAlso', 'subClassOf', 'subPropertyOf',
];

const xsd_terms = [
    'anyURI', 'base64Binary', 'boolean', 'byte', 'date', 'dateTime', 'decimal',
    'double', 'float', 'gDay', 'gMonth', 'gMonthDay', 'gYear', 'gYearMonth',
    'hexBinary', 'int', 'integer', 'language', 'long', 'Name', 'NCName',
    'negativeInteger', 'NMTOKEN', 'nonNegativeInteger', 'nonPositiveInteger',
    'normalizedString', 'positiveInteger', 'short', 'string', 'time', 'token',
    'unsignedByte', 'unsignedInt', 'unsignedLong', 'unsignedShort',
];

const wm_terms = [
    'Form', 'fields', 'minSize', 'predicate', 'stretchSize'
];

const namespaces = {
    cc:     prefix ('cc',    'http://creativecommons.org/ns#',              []),
    dc11:   prefix ('dc11',  'http://purl.org/dc/elements/1.1/',            []),
    dc:     prefix ('dc',    'http://purl.org/dc/terms/',                   []),
    foaf:   prefix ('foaf',  'http://xmlns.com/foaf/0.1/',                  []),
    // FIXME: move to licensedb specific code
    li:     prefix ('li',    'https://licensedb.org/ns#',                   []),
    owl:    prefix ('owl',   'http://www.w3.org/2002/07/owl#',              owl_terms),
    rdf:    prefix ('rdf',   'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdf_terms),
    rdfs:   prefix ('rdfs',  'http://www.w3.org/2000/01/rdf-schema#',       rdfs_terms),
    schema: prefix ('schema','http://schema.org/',                          []),
    spdx:   prefix ('spdx',  'http://spdx.org/rdf/terms#',                  []),
    wm:     prefix ('wm',    'https://waldmeta.org/ns#',                    wm_terms),
    xml:    prefix ('xml',   'http://www.w3.org/XML/1998/namespace',        []),
    xsd:    prefix ('xsd',   'http://www.w3.org/2001/XMLSchema#',           xsd_terms),
};

function qname (iri, _prefixes) {
    if (!_prefixes) {
        _prefixes = namespaces;
    }

    let ret = null;
    for (let prefix in _prefixes) {
        if (_prefixes.hasOwnProperty (prefix)) {
            ret = _prefixes[prefix].qname (iri);
            if (ret) {
                break;
            }
        }
    }

    return ret ? ret : iri;
};

function shortenKeys (obj, _prefixes) {
    if (!_prefixes) {
        _prefixes = namespaces;
    }

    if (Array.isArray (obj)) {
        return obj.map ((item) => shortenKeys (item, _prefixes));
    }

    var ret = {};
    Object.keys (obj).map ((key) => { ret[qname (key, _prefixes)] = obj[key]; });

    return ret;
};

function loadPrefixes (prefixes) {
    // always use our built-in instances for these prefixes
    const builtIn = [ 'owl', 'rdf', 'rdfs', 'wm', 'xsd' ];
    const ret = {};

    for (let key in prefixes) {
        // FIXME: figure out why prefixes returned by N3 do not have the
        // hasOwnProperty method and fix it.
        if (Object.hasOwnProperty.call(prefixes, key)) {
            if (builtIn[key]) {
                ret[key] = namespaces[key];
            } else {
                ret[key] = prefix (key, prefixes[key], []);
            }
        }
    }

    return ret;
};

module.exports = {
    a: namespaces.rdf.type,
    loadPrefixes: loadPrefixes,
    namespaces: namespaces,
    prefix: prefix,
    qname: qname,
    shortenKeys: shortenKeys,
};

// -*- mode: web -*-
// -*- engine: jsx -*-
