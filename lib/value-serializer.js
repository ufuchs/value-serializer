/*jslint node: true */
/*jslint todo: true */
/*jslint nomen: true */

/*!
 * value-serializer
 * Copyright(c) 2014 Uli Fuchs <ufuchs@gmx.com>
 * GPLv2 Licensed
 *
 * [ Success is the ability to go from one failure to another with no loss  ]
 * [ of enthusiasm.                               - Sir Winston Churchill - ]
 */

var util = require('util');

(function () {

    'use strict';

    var serializer,
        format = util.format;

    /************************************
        Helpers
    ************************************/

    //
    // getSerializedLength
    //
    function getSerializedLength(descriptors) {
        return descriptors.reduce(function (length, desc) {
            return length + desc.length;
        }, 0);
    }

    //
    // generateStringWithLength
    //
    function generateStringWithLength(length, fillChar) {

        length = +length || 0;

        if (length <= 0) {
            return '';
        }

        fillChar = fillChar || ' ';

        var halfLength = length / 2,
            result = fillChar;

        while (result.length <= halfLength) {
            result += result;
        }

        return result + result.substring(0, length - result.length);

    }

    //
    // padField
    //
    function padField(desc, value) {

        value = (value || '').toString();

        var padLen = desc.length - value.length,
            padding,
            paddified = '';

        padding = generateStringWithLength(padLen, desc.fillChar);

        if (desc.alignment === 'L') {
            paddified = value + padding;
        } else {
            paddified = padding + value;
        }

        return paddified;

    }

    //
    // exceptMsg
    //
    function exceptMsg(desc, msg) {
        return format(
            "*** Error in property '%s'\n%s",
            desc.fieldName,
            msg
        );
    }

    //
    // validateAgainstModel
    //
    function validateAgainstModel(obj, descriptors) {

        // PREREQUESTS
        // must be still done!

        descriptors.forEach(function (desc) {

            var msg,
                value = obj[desc.fieldName].toString();

            if (desc.type === 'AN') {
                // remove any white spaces
                value = value.trim();
                obj[desc.fieldName] = value;
            }

            // field type
            if ((desc.type === 'N') && (isNaN(value))) {
                msg = format('    Cause : Wrong field type. Expected Number, but was String.\n');
                msg += format("    Value : '%s'", value);
                throw exceptMsg(desc, msg);
            }

            // length check
            if (value.length > desc.length) {
                msg = format('    Cause : Field too long. Expected %d chars, but was %d.\n', desc.length, value.length);
                msg += format("    Value : '%s'", value);
                throw exceptMsg(desc, msg);
            }

            // obligatory check
            if ((desc.obligatory === 'Y') && (value.length === 0)) {
                msg = format('    Cause : Field is obligatory. Expected max %d chars, but was %d.\n', desc.length, value.length);
                msg += format("    Value : '%s'", value);
                throw exceptMsg(desc, msg);
            }

        });

    }

    /************************************
        ValueSerializer Constructor
    ************************************/

    function ValueSerializer(validator) {
        this.validator = validator;
    }

    /************************************
        ValueSerializer Prototype
    ************************************/

    ValueSerializer.prototype = {

        createObjectFrom : function (descriptors) {

            var value;

            return descriptors.reduce(function (obj, desc) {

                if (desc.type === 'AN') {
                    value = '';
                } else if (desc.type === 'N') {
                    value = 0;
                }

                obj[desc.fieldName] = value;

                return obj;

            }, {});

        },

        validate : function (obj, descriptors) {
            validateAgainstModel(obj, descriptors);
        },

        serialize : function (obj, descriptors, testDeli) {

            testDeli = testDeli || '';

            return descriptors.reduce(function (serialized, desc) {
                return serialized + testDeli + padField(desc, obj[desc.fieldName]);
            }, '') + testDeli;
        },

        deserialize : function (serialized, descriptors) {
            return getSerializedLength(descriptors);
        }

    };

    serializer = function () {
        return new ValueSerializer();
    };

    /**
     * Expose `valueSerializer`.
     */

    // CommonJS module is defined
    if (module !== 'undefined' && module.exports) {
        module.exports = serializer;

    }

}());
