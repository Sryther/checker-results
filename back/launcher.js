var config = require('./config');
var _ = require('lodash');
var Promise = require('bluebird');

var ROOT = "http://publinet.ac-bordeaux.fr/pubce1/";
var RESULTPAGE = ROOT + "resultats?idBaseSession=pubce1_0&actionId=3";
var LOOKFOR = "CONCOURS EXTERNE PUBLIC - ACADEMIE DE BORDEAUX";

var receivers = [
  {
    mail: 'paul.rey@sryther.fr',
    sms: '0033670933414'
  }
];

var request = require('./src/request')(config);
var searchResults = require('./src/searchResults')(config);
var errorHandler = require('./src/errorHandler');
var mail = require('./src/mail')(config.smtp);
var sms = require('./src/sms')(config.ovh);

request.getPage(RESULTPAGE)
  .catch(errorHandler('Cannot get page'))
  .then(searchResults.lookForResults(LOOKFOR))
  .catch(errorHandler('Unable to find results'))
  .then(function(results) {
    if (results) {
      console.log(results);
      return Promise.resolve(ROOT + results.toString());
    } else {
      return Promise.resolve(null);
    }
  })
  .then(mail.sendMail(receivers))
  .catch(errorHandler('Cannot send mail'));
  // .then(sms.sendSms(receivers))
  // .catch(errorHandler('Cannot send the sms'));

/**
 * Used to debug.
 * @param  {Object} thing - Whatever you want.
 */
function debug(thing) {
  var time = new Date().toISOString();
  console.log(time, thing);
}
