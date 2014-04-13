#!/usr/bin/env node

/*jslint node:true, unparam:true*/

'use strict';

var serializer = require('../lib/value-serializer'),
    Intl = require('intl'),
    descriptors = require('./oilInvo.json').oilInvo,
    invo = serializer().createObjectFrom(descriptors),
    serialized;

console.log("\n1. Generate an empty 'invoice' object by use of 'oilInvo.json', the model");
console.log("-------------------------------------------------------------------------\n");

console.log(invo);


console.log("\n2. Now fill in some data in your 'invoice' object");
console.log("-------------------------------------------------\n");

invo.customerID = 4056;
invo.invoiceDate = new Date()
    .toISOString()
    .replace(/^(\d{4})\-(\d{2})\-(\d{2})\S*$/, '$2/$3/$1');
invo.invoiceAmount = 40.50;
invo.text = "You will get 10% discount";

console.log(invo);

console.log("\n4.0 Validate the 'invoice' object against the model");
console.log("---------------------------------------------------\n");

serializer().validate(invo, descriptors);

console.log("  If you doesn't see any output, feel lucky!\n");

console.log("\n5.0 Serialize the 'invoice' object for your legacy bookkeeping system");
console.log("---------------------------------------------------------------------\n");

serialized = serializer().serialize(invo, descriptors);

console.log(serialized + '\n');



console.log("\n6.0 Re-generate the 'invoice' object from a given output string");
console.log("---------------------------------------------------------------\n");

console.log(serializer().deserialize(serialized, descriptors));

