/*jslint node: true */
/*jslint todo: true */
/*jslint nomen: true */

/*!
 * value-validater
 * Copyright(c) 2014 Uli Fuchs <ufuchs@gmx.com>
 * GPLv2 Licensed
 *
 * [ Success is the ability to go from one failure to another with no loss  ]
 * [ of enthusiasm.                               - Sir Winston Churchill - ]
 */

var util = require('util');

(function () {

    'use strict';

    var validator,
        format = util.format;

    /************************************
        Helpers
    ************************************/

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

        descriptors.forEach(function (desc) {

            var msg,
                value = obj[desc.fieldName].toString();

            if (desc.type === 'AN') {
                // remove any white spaces
                value = value.trim();
                obj[desc.fieldName] = value;
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
        Validator Constructor
    ************************************/

    function Validator() {}

    /************************************
        ValueSerializer Prototype
    ************************************/

    Validator.prototype = {

        validate : function (obj, descriptors, logicValidator) {

            var hasLogicValidator = ((logicValidator !== undefined)
                || (logicValidator !== null))
                && (typeof logicValidator === "object");

            validateAgainstModel(obj, descriptors);

            if (hasLogicValidator) {
                logicValidator.validate(obj, descriptors);
            }


        }

    };

    validator = function () {
        return new Validator();
    };

    /**
     * Expose `validator`.
     */

    // CommonJS module is defined
    if (module !== 'undefined' && module.exports) {
        module.exports = validator;

    }

}());
