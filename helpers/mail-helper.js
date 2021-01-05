const sgMail = require('@sendgrid/mail');
const sgMailApiKey = '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'
sgMail.setApiKey(sgMailApiKey)










module.exports={
     sendForgotPassword :(to, from, templateId, dynamic_template_data) => {
        const msg = {
            to,
            from: { name: 'Movie Cafe', email: from },
            templateId,
            dynamic_template_data
        };
        console.log(msg)
        sgMail.send(msg)
            .then((response) => {
                console.log('mail-sent-successfully', { templateId, dynamic_template_data });
                console.log('response', response);
                /* assume success */
    
            })
            .catch((error) => {
                /* log friendly error */
                console.error('send-grid-error: ', error.toString());
            });
    },


    
}