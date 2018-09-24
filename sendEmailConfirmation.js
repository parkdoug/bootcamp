'use strict';
const AWS = require('aws-sdk');

const SES = new AWS.SES();

// Send a verification email to the given email address.
function sendVerification(email, callback) {
    SES.verifyEmailIdentity({
        EmailAddress: email
    }, (err) => {
        console.log('threw error in send verify');
        callback(err || 'Verification email sent. Please verify it.');
    });
}

// Check whether email is verified. Only verified emails are allowed to send emails to or from.
function checkEmail(email, callback) {
    SES.getIdentityVerificationAttributes({
        Identities: [email]
    }, (err, data) => {
        if (err) {
            console.log('error in check email');
            callback(err);
            return;
        }
        const attributes = data.VerificationAttributes;
        if (!(email in attributes) || attributes[email].VerificationStatus !== 'Success') {
            console.log('sending verification');
            sendVerification(email, callback);
        } else {
            console.log('success check verified');
            callback(err, data);
        }
    });
}

exports.handler = (event, context, callback) => {
    console.log('Received event:', event);
    //SES details
    let EMAIL_ADDRESS = event.Details.ContactData.Attributes.empEmail;
    let SUP_EMAIL_ADDRESS = event.Details.ContactData.Attributes.supEmail;
    
    checkEmail(EMAIL_ADDRESS, (err) => {
        if (err) {
            console.log(`Failed to check email: ${EMAIL_ADDRESS}`, err);
            callback(null, buildResponse(false, err));
            return;
        }

        console.log("check email passed");
        const subject = `AmazonConnect Notice.  Employee Password Change Confirmation`;
        const bodyText = `This is a confirmation email that your password has been changed`;
        const params = {
            Source: EMAIL_ADDRESS,
            Destination: {
                ToAddresses: [EMAIL_ADDRESS],
                CcAddresses: [SUP_EMAIL_ADDRESS]
            },
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Text: {
                        Data: bodyText
                    }
                }
            },
        };
        SES.sendEmail(params, (err, data) => {
            console.log('send email place');
            if (err) {
                console.log(JSON.stringify(err));
                console.log(err);
                callback(null, buildResponse(false, err))
            } else {
                console.log('successfull, create response');
                callback(null, buildResponse(true, data));
            }
        });
    });

};

function buildResponse(isSuccess, result) {
    if (isSuccess) {
        console.log('in success');
        //console.log(result);
        return {
            wasSuccess: "true",
            lambdaResult: "Success"

        };
    } else {
        console.log('in error');
        console.log(result);
        return {
            lambdaResult: "Success",
            wasSuccess: "false"

        };
    }
}