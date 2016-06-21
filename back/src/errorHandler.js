'use strict';

module.exports = function(config) {
  /**
   * Handles errors.
   * @param  {string} message - The message to use to help the debug.
   */
  return function errorHandler(message) {
    return function (err) {
      console.log(message);
      console.error(err);

    //   var opts = _.cloneDeep(mailOptions);
    //   opts.to = 'paul.rey@sryther.fr';
    //   opts.subject = 'Error';
    //   opts.text = message + ": " + JSON.stringify(err, null, 2);
    //   opts.html = message + ":<br><pre>" + JSON.stringify(err, null, 2) + "</pre>";
    //
    //   mail.sendMail(opts)
    //     .catch(function(err) {
    //       console.error(err);
    //       process.exit(1);
    //     })
    //     .then(function(info) {
    //       console.log(info);
    //       process.exit(1);
    //     });
    };
  };
};
