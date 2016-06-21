'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(config, lookFor) {
  return {
    lookForResults: lookForResults,
    isResultAvailable: isResultAvailable,
  };

  /**
   * Looks for the results within the page.
   * @param  {string} lookFor - The term we're lookiing for.
   * @return {Promise<Object>} - Returns a Promise that resolves the node we're looking for.
   */
  function lookForResults(lookFor) {
    return function(parsedPage) {
      return new Promise(function(resolve) {
        findResult(parsedPage.childNodes);

        /**
         * Finds the string we're looking for recursively in the node
         * @param  {Object} node - The node to verify
         * @return {Object} - Returns the node found or null
         */
        function findResult(node) {
          return _.find(node, function(o) {
            if (o.childNodes) {
              var found = findResult(o.childNodes);
              if (found) {
                resolve(found);
                return false;
              }
            } else {
              return o.value === lookFor;
            }
          });
        }
      });
    };
  }

  /**
   * Verifies if the results are available.
   * @param  {Object} node - The corresponding HTML node to verify.
   * @return {Promise<string>} - Returns a Promise that resolves an URL or undefined if it's not available.
   */
  function isResultAvailable(node) {
    return Promise.resolve(isParentLink(node));

    /**
     * Verifies if the parent node is a link (<a> tag).
     * @param  {Object} node - The node to verify.
     * @return {Boolean} - Returns if the parent node is a link or not.
     */
    function isParentLink(node) {
      if (node.parentNode && node.parentNode.nodeName === 'a') {
        var attr = _.find(node.parentNode.attrs, function(o) {
          return o.name === 'href';
        });

        if (attr) {
          return attr.value;
        }
      }
      return false;
    }
  }
};
