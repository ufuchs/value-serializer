/*jslint node: true */
/*jslint todo: true */
/*jslint nomen: true */

var validator = require('../lib/value-validator'),
    serializer = require('../lib/value-serializer'),
    descriptors = require('./orders.json').order,
    order = serializer().createObjectFrom(descriptors),
    serialized;


order.customerID = 1034056;
order.orderID = 5670876;
order.orderDate = '2014-01*01';
// order.orderDate = new Date()
//     .toISOString()
//     .replace(/^(\d{4})\-(\d{2})\-(\d{2}).*$/, '$2/$3/$1');
order.item = 'ATmega328P-PU';
order.qty = '0000';
order.price = '2.0X';
order.note = "special customer with 5% discount         \n       ";

validator().validate(order, descriptors);
