'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(config) {
  var errorHandler = require('./errorHandler');
  var ovh = require('ovh')(config);

  return {
    sendSms: sendSms
  };

  function sendSms(receivers, url) {
    receivers = _.reduce(receivers, function(result, value, key) {
      result.push(value.sms);
      return result;
    }, []);

    return  ovh.requestPromised('GET', '/sms')
      .catch(errorHandler('Cannot get the service name'))
      .then(function(serviceName) {
        console.log('Sending SMS.');
        // Send a simple SMS with a short number using your serviceName
        // return ovh.requestPromised('POST', '/sms/{serviceName}/jobs', {
        //   serviceName: serviceName,
        //   message: 'Les résultats de votre concours sont disponibles ( ' + url + ')! Veuillez ne pas répondre à ce sms.',
        //   senderForResponse: true,
        //   sender: 'Sryther',
        //   receivers: receivers
        // });
      })
      .catch(errorHandler('Cannot send a sms'));;
  }
};
