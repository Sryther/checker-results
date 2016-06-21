'use strict';

var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var _ = require('lodash');

Promise.promisifyAll(nodemailer);

module.exports = function(config) {
  var transporter = nodemailer.createTransport(smtpTransport(config.smtp));

  return {
    sendMail: sendMail
  };

  /**
   * Sends an email if the results are available.
   * @param  {array} receivers - The receivers of the mail.
   * @return {function} - Returns a function that sends mail to receivers.
   */
  function sendMail(receivers) {

    /**
     * @param  {Object} results - The HTML.
     * @return {Promise<Object>} - Returns a Promise that resolves the send mail status.
     */
    return function(results) {
      if (results) {
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"Paul Rey" <paul.rey@sryther.fr>', // sender address
            to: receivers.join(', '), // list of receivers
            subject: 'Résultats disponibles !', // Subject line
            text: '', // plaintext body
            html: '' // html body
        };

        var url = results;
        var htmlUrl = '<a href="' + url + '">' + url + '</a>';
        var opts = _.cloneDeep(mailOptions);
        opts.text = url;
        opts.html = htmlUrl;

        console.log('Mail is sending !');
        return transporter.sendMail(opts);
      }
    };
  }
};