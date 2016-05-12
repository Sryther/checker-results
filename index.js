var _ = require('lodash');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var htmlparser = require('parse5');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var config = require('./config');

Promise.promisifyAll(request);
Promise.promisifyAll(nodemailer);

var ROOT = "http://publinet.ac-bordeaux.fr/pubce1/";
var RESULTPAGE = ROOT + "resultats?idBaseSession=pubce1_0&actionId=3";
var LOOKFOR = "CONCOURS EXTERNE PUBLIC - ACADEMIE DE BORDEAUX";

program();

function program() {

  var transporter = nodemailer.createTransport(smtpTransport(config.smtp));

  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: '"Paul Rey" <paul.rey@sryther.fr>', // sender address
      to: 'paul.rey@sryther.fr, spmagali@wanadoo.fr', // list of receivers
      subject: 'Résultats disponibles !', // Subject line
      text: '', // plaintext body
      html: '' // html body
  };

  getPage()
    .catch(errorHandler('Cannot get page'))
    .then(parse)
    .catch(errorHandler('Cannot parse the page'))
    .then(lookForResults)
    .catch(errorHandler('Unable to find results'))
    .then(isResultAvailable)
    .catch(errorHandler('Cannot check availability'))
    .then(sendMail)
    .catch(errorHandler('Cannot send mail'))
    .then(debug);

  /**
   * Gets the page.
   * @return {Promise<Object>} - Returns a Promise that resolves a HTML page.
   */
  function getPage() {
    return request(RESULTPAGE);
  }

  /**
   * Parses the HTML page.
   * @param  {Object} page - The page returned by a request.
   * @return {Object} - Returns a Promise that resolves a parsed HTML page.
   */
  function parse(page) {
    return Promise.resolve(htmlparser.parse(page.body));
  }

  /**
   * Looks for the results within the page.
   * @param  {Object} parsedPage - The HTML page.
   * @return {Promise<Object>} - Returns a Promise that resolves the node we're looking for.
   */
  function lookForResults(parsedPage) {
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
            return o.value === LOOKFOR;
          }
        });
      }
    });
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

  /**
   * Sends an email if the results are available.
   * @param  {string} isAvailable - Are the results avaiable.
   * @return {Promise<Object>} - Returns a Promise that resolves the send mail status.
   */
  function sendMail(isAvailable) {
    if (isAvailable) {
      var url = ROOT + isAvailable;
      var htmlUrl = '<a href="' + url + '">' + url + '</a>';
      var opts = _.cloneDeep(mailOptions);
      opts.text = url;
      opts.html = htmlUrl;

      return transporter.sendMail(opts);
    }  else {
      return Promise.resolve(null);
    }
  }

  /**
   * Used to debug.
   * @param  {Object} thing - Whatever you want.
   */
  function debug(thing) {
    var time = new Date().toISOString();
    console.log(time, thing);
  }

  /**
   * Handles errors.
   * @param  {string} message - The message to use to help the debug.
   */
  function errorHandler(message) {
    return function (err) {
      console.log(message);
      console.error(err);

      var opts = _.cloneDeep(mailOptions);
      opts.to = 'paul.rey@sryther.fr';
      opts.subject = 'Error';
      opts.text = message + ": " + JSON.stringify(err, null, 2);
      opts.html = message + ":<br>" + JSON.stringify(err, null, 2);

      transporter.sendMail(opts)
        .catch(function(err) {
          console.error(err);
          process.exit(1);
        })
        .then(function(info) {
          console.log(info);
          process.exit(1);
        });
    };
  }

}
