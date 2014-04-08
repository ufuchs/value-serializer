/*jslint node:true, unparam:true*/

'use strict';

var serializer = require('../lib/value-serializer'),
    descriptors = require('./orders.json').order,
    order = serializer().createObjectFrom(descriptors),
    serialized;

console.log("\n1. Generate an empty 'order' object by use of 'order.json', the model");
console.log("---------------------------------------------------------------------\n");

console.log(order);

console.log("\n2. Now fill in some data in your 'order' object");
console.log("-----------------------------------------------\n");

order.customerID = 1034056;
order.orderID = 5670876;
order.orderDate = new Date()
    .toISOString()
    .replace(/^(\d{4})\-(\d{2})\-(\d{2}).*$/, '$2/$3/$1');
order.item = 'ATmega328P-PU';
order.qty = 10;
order.price = 2.02;
order.note = "special customer with 5% discount";

console.log(order);

console.log("\n4.0 Validate the 'order' object against model.");
console.log("----------------------------------------------\n");

serializer().validate(order, descriptors);

console.log("\n  If you doesn't see any output, feel lucky!\n");

console.log("\n5.0 Serialize the 'order' object for your legacy bookkeeping system");
console.log("-------------------------------------------------------------------\n");

serialized = serializer().serialize(order, descriptors);

console.log(serialized + '\n');

console.log("\n6.0 Deserialize the 'order' object from the generated output string");
console.log("-------------------------------------------------------------------\n");

console.log("  *** At present in raw format. Needs some regexs to correct.***\n");

console.log(serializer().deserialize(serialized, descriptors));
