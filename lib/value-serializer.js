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

    //
    // generateStringWithLength
    //
    function generateStringWithLength(length, char) {

        length = +length || 0;
        char = char || ' ';

        if (length <= 0) {
            return '';
        }

        var halfLength = length / 2,
            result = char;

        while (result.length <= halfLength) {
            result += result;
        }

        return result + result.substring(0, length - result.length);

    }

    //
    // padField
    //
    function padField(desc, value) {

        value = value.toString() || '';

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

////////////////////////////////////////////////////////////////////////////////

    function ValueSerializer() {};

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

        serialize : function (obj, descriptors) {
            return descriptors.reduce(function (serialized, desc) {
                return serialized + padField(desc, obj[desc.fieldName]);
            }, '');
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
