/**
 *   This file is part of wald:grid.
 *   Copyright (C) 2016  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.0.  See LICENSE.txt.
 */

'use strict';

/* eslint  quotes:0  max-len:0 */

module.exports = {
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

