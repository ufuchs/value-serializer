/*jslint node: true */
/*jslint todo: true */
/*jslint nomen: true */

/*!
 * value-serializer
 * Copyright(c) 2014 Uli Fuchs <ufuchs@gmx.com>
 * GPLv2 Licensed
 *
 * [ A person who won't read has no advantage over one who can't read. ]
 * [                                                     - Mark Twain -]
 */

(function () {

    'use strict';

    var serializer;

    /************************************
        Helpers
    ************************************/

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

        if (padLen < 0) {
            throw 'Value to long : ' + value;
        }

        padding = generateStringWithLength(padLen, desc.fillChar);

        if (desc.alignment === 'L') {
            paddified = value + padding;
        } else {
            paddified = padding + value;
        }

        return paddified;

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

        serialize : function (obj, params, testDeli) {

            testDeli = testDeli || '';

            return params.descriptors.reduce(function (serialized, desc) {
                return serialized + testDeli + padField(desc, obj[desc.fieldName]);
            }, '') + testDeli;
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
