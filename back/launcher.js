var config = require('./config');
var _ = require('lodash');
var Promise = require('bluebird');

var ROOT = "http://publinet.ac-bordeaux.fr/pubce1/";
var RESULTPAGE = ROOT + "resultats?idBaseSession=pubce1_0&actionId=3";
var LOOKFOR = "CONCOURS EXTERNE PUBLIC - ACADEMIE DE BORDEAUX";

// var receivers = ['paul.rey@sryther.fr', 'spmagali@wanadoo.fr'];
var receivers = ['paul.rey@sryther.fr'];

var request = require('./src/request')(config);
var searchResults = require('./src/searchResults')(config);
var errorHandler = require('./src/errorHandler')(config);
var mail = require('./src/mail')(config);

request.getPage(RESULTPAGE)
  .catch(errorHandler('Cannot get page'))
  .then(searchResults.lookForResults(LOOKFOR))
  .catch(errorHandler('Unable to find results'))
  .then(function(results) {
    if (results) {
      return Promise.resolve(ROOT + results);
    } else {
      return Promise.resolve(null);
    }
  })
  .then(mail.sendMail(receivers))
  .catch(errorHandler('Cannot send mail'));

/**
 * Used to debug.
 * @param  {Object} thing - Whatever you want.
 */
function debug(thing) {
  var time = new Date().toISOString();
  console.log(time, thing);
}
