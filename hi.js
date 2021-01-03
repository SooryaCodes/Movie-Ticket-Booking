const sgMail = require('@sendgrid/mail');
const sgMailApiKey = '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'
sgMail.setApiKey(sgMailApiKey)
const sendTemplate = (to,from, templateId, dynamic_template_data) => {
  const msg = {
    to,
    from: { name: 'Fix That Device', email: from },
    templateId,
    dynamic_template_data
  };
  console.log(msg)
  sgMail.send(msg)
    .then((response) => {
      console.log('mail-sent-successfully', {templateId, dynamic_template_data });
      console.log('response', response);
      /* assume success */

    })
    .catch((error) => {
      /* log friendly error */
      console.error('send-grid-error: ', error.toString());
    });
};

var dynamic_template_data={
  Name:'Soorya'
}
sendTemplate('galaxieon.dev@gmail.com','sooryakriz111@gmail.com','d-be0314b8f200467788d3dc4fd0ab4f7d',dynamic_template_data)