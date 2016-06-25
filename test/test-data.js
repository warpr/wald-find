/**
 *   This file is part of wald:find - a library for querying RDF.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 */

'use strict';

/* eslint  quotes:0  max-len:0 */

'use strict';

(function (factory) {
    const imports = ['require'];

    if (typeof define === 'function' && define.amd) {
        define (imports, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory (require);
    } else {
        console.log ('Module system not recognized, please use AMD or CommonJS');
    }
} (function (require) {
    return {
        "license-form.ttl": `
@prefix cc: <http://creativecommons.org/ns#> .
@prefix dc: <http://purl.org/dc/terms/> .
@prefix dc11: <http://purl.org/dc/elements/1.1/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix li: <https://licensedb.org/ns#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix spdx: <http://spdx.org/rdf/terms#> .
@prefix xml: <http://www.w3.org/XML/1998/namespace> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix wm: <https://waldmeta.org/ns#> .

<https://example.org/license-form.ttl> a wm:Form ;
    dc:title "License Edit Form" ;
    wm:fields (
        [ a wm:Field; wm:predicate li:id; wm:minSize 2; ]
        [ a wm:Field; wm:predicate dc:title; wm:minSize 2; wm:stretchSize 4; ]
        [ a wm:Field; wm:predicate dc:hasVersion; ]
        [ a wm:Field; wm:predicate foaf:logo; wm:minSize 3; wm:stretchSize 4; ]
        [ a wm:Field; wm:predicate dc:subject; wm:minSize 2; wm:stretchSize 3; ]
    ) .

li:id rdfs:range xsd:string, [
    a owl:Restriction;
    owl:onProperty li:id;
    owl:maxCardinality 1;
    owl:minCardinality 1;
].

dc:title rdfs:range rdfs:Literal, [
    a owl:Restriction;
    owl:onProperty dc:title;
    owl:minCardinality 1;
].

dc:hasVersion rdfs:range xsd:string, [
    a owl:Restriction;
    owl:onProperty dc:hasVersion;
    owl:maxCardinality 1;
].

foaf:logo rdfs:range foaf:Image.
dc:subject rdfs:range rdfs:Resource.
`,
        "copyleft-next-0.3.0.ttl": `
@prefix cc: <http://creativecommons.org/ns#> .
@prefix dc: <http://purl.org/dc/terms/> .
@prefix dc11: <http://purl.org/dc/elements/1.1/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix li: <https://licensedb.org/ns#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix spdx: <http://spdx.org/rdf/terms#> .
@prefix xml: <http://www.w3.org/XML/1998/namespace> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://licensedb.org/id/copyleft-next-0.3.0> a cc:License,
        li:License ;
    cc:legalcode <https://raw.githubusercontent.com/richardfontana/copyleft-next/master/Releases/copyleft-next-0.3.0> ;
    cc:permits cc:DerivativeWorks,
        cc:Distribution,
        cc:Reproduction ;
    cc:requires cc:Copyleft,
        cc:Notice,
        cc:SourceCode ;
    dc:creator <http://dbpedia.org/resource/Richard_Fontana>,
        <http://www.wikidata.org/entity/Q7325725> ;
    dc:hasVersion "0.3.0" ;
    dc:identifier "copyleft-next" ;
    dc:replaces <https://licensedb.org/id/copyleft-next-0.2.1> ;
    dc:title "copyleft-next" ;
    li:id "copyleft-next-0.3.0" ;
    li:name "copyleft-next 0.3.0" ;
    li:plaintext <https://licensedb.org/id/copyleft-next-0.3.0.txt>,
        <https://raw.githubusercontent.com/richardfontana/copyleft-next/master/Releases/copyleft-next-0.3.0> .

<https://www.wikidata.org/wiki/Q7325725> owl:sameAs <http://dbpedia.org/page/Richard_Fontana> .
    `
};

}));

// -*- mode: web -*-
// -*- engine: jsx -*-
