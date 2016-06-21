var config = require('./config');
var _ = require('lodash');
var Promise = require('bluebird');

var ROOT = "http://publinet.ac-bordeaux.fr/pubce1/";
var RESULTPAGE = ROOT + "resultats?idBaseSession=pubce1_1&actionId=3"; // Admission
// var RESULTPAGE = ROOT + "resultats?idBaseSession=pubce1_0&actionId=3"; // Admissibilité
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
var locker = require('./src/locker')();

request.getPage(RESULTPAGE)
  .catch(errorHandler('Cannot get page'))
  .then(searchResults.lookForResults(LOOKFOR))
  .catch(errorHandler('Unable to find results'))
  .then(searchResults.isResultAvailable)
  .catch(errorHandler('Unable to know if results are available'))
  .then(function(result) {
    if (result) {
      console.log('Results found !');
      return Promise.resolve(ROOT + result);
    } else {
      console.log('Not found');
      return Promise.resolve(null);
    }
  })
  // .then(mail.sendMail(receivers))
  // .catch(errorHandler('Cannot send mail'))
  .then(locker.check)
  .catch(errorHandler('Cannot check the lock'))
  .then(function(isLocked) {
    if (!isLocked) {
      locker.lock();
      return sms.sendSms(receivers);
    } else {
      return Promise.resolve();
    }
  })
  .catch(errorHandler('Cannot send the sms'));

/**
 * Used to debug.
 * @param  {Object} thing - Whatever you want.
 */
function debug(thing) {
  var time = new Date().toISOString();
  console.log(time, thing);
}
