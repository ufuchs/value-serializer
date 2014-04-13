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
 *
 *
 * do to
 * -----
 * 1.separate messages
 * 2.comment functions
 * 3.unit tests
 *
 */

var util = require('util');

(function () {

    'use strict';

    var serializer,
        format = util.format,
        testDeli = '';

    /************************************
        Helpers
    ************************************/

    //
    // getLengthBy
    //
    function getLengthBy(descriptors) {
        return descriptors.reduce(function (length, desc) {
            return length + desc.length + 2 * testDeli.length;
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

        value = value || '';

        if (desc.type === 'C') {
            // handle currency
            value = value.toFixed(2);
        }

        var padLen = desc.length - value.toString().length,
            padding,
            paddified = '';

        padding = generateStringWithLength(padLen, desc.fillChar);

        if (desc.alignment === 'L') {
            paddified = value + padding;
        } else {
            paddified = padding + value;
        }

        if (testDeli.length !== 0) {
            // For an optical review of the paddified value
            // surround it with a testDeli, e.g. '|'
            paddified = testDeli + paddified + testDeli;
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
            if (((desc.type === 'C') || (desc.type === 'N')) && (isNaN(value))) {
                msg = format('    Cause : Wrong field type. Expected Number, but is something else.\n');
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

    //
    // correctValue
    //
    function correctValue(value, desc) {

        function preg_quote(str, delimiter) {
            //  discuss at: http://phpjs.org/functions/preg_quote/
            // original by: booeyOH
            // improved by: Ates Goral (http://magnetiq.com)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Brett Zamir (http://brett-zamir.me)
            // bugfixed by: Onno Marsman
            //   example 1: preg_quote("$40");
            //   returns 1: '\\$40'
            //   example 2: preg_quote("*RRRING* Hello?");
            //   returns 2: '\\*RRRING\\* Hello\\?'
            //   example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
            //   returns 3: '\\\\\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:'

            return String(str)
                .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
        }

        value = value.trim();

        var fillChar,
            regex,
            match;

        if ((desc.fillChar.length === 1) && (desc.fillChar !== ' ')) {

            fillChar = preg_quote(desc.fillChar);

            switch (desc.alignment) {
            case 'R':
                regex = new RegExp('^' + fillChar + '*(\\S*\\s*\\S*)$');
                break;
            case 'L':
                regex = new RegExp('^(\\S*\\s*\\S*)' + fillChar + '*$');
                break;
            }
        }

        if (regex !== undefined) {
            match = value.match(regex);
            value = match[1];
        }

        if ((desc.type === 'C') || (desc.type === 'N')) {
            value = +value;
        }

        return value;

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
                    value = desc.length === desc.fillChar.length
                        // copy any static text as fillChar
                        ? desc.fillChar
                        : '';
                } else if ((desc.type === 'C') ||  (desc.type === 'N')) {
                    value = 0;
                }

                obj[desc.fieldName] = value;

                return obj;

            }, {});

        },

        validate : function (obj, descriptors) {
            validateAgainstModel(obj, descriptors);
        },

        serialize : function (obj, descriptors) {
            return descriptors.reduce(function (serialized, desc) {
                return serialized + padField(desc, obj[desc.fieldName]);
            }, '');
        },

        deserialize : function (serialized, descriptors) {

            serialized = serialized || '';

            var serializedLength = getLengthBy(descriptors),
                msg,
                deserialized;

            if (testDeli.length > 0) {
                msg = "*** Error during 'deserialization'\n";
                msg += format("    Cause : Misplaced 'testDeli'. Expected '', but was '%s'.\n", testDeli);
                msg += format("    Value : '%s'", serialized);
                throw msg;

            }

            if (serializedLength !== serialized.length) {
                msg = "*** Error during 'deserialization'\n";
                msg += format('    Cause : String length differs. Expected %d chars, but was %d.\n', serializedLength, serialized.length);
                msg += format("    Value : '%s'", serialized);
                throw msg;

            }

            deserialized = descriptors.reduce(function (obj, desc) {

                obj[desc.fieldName] = serialized.substring(desc.start - 1, desc.start - 1 + desc.length);

                return obj;

            }, {});

//            console.log(deserialized);

            descriptors.forEach(function (desc) {

                var value = deserialized[desc.fieldName];

                deserialized[desc.fieldName] = correctValue(value, desc);

            });

            return deserialized;

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
