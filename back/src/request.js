'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var htmlparser = require('parse5');

Promise.promisifyAll(request);

module.exports = function(config) {
  return {
    getPage: getPage,
    parse: parse,
  };

  /**
   * Gets the page.
   * @return {Promise<Object>} - Returns a Promise that resolves a HTML page.
   */
  function getPage(page) {
    return request(page)
      .then(parse);
  }

  /**
   * Parses the HTML page.
   * @param  {Object} page - The page returned by a request.
   * @return {Object} - Returns a Promise that resolves a parsed HTML page.
   */
  function parse(page) {
    return Promise.resolve(htmlparser.parse(page.body));
  }
};
