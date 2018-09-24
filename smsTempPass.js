var AWS = require("aws-sdk");
    var pinpoint = new AWS.Pinpoint();

    //main entry 
    exports.handler = (event, context, callback) => {
        console.log("Incoming Event: " + JSON.stringify(event));
            
        //You must have these attributes set in your Contact Flow prior to invoking lambda function
        var destinationNumber = event.Details.ContactData.CustomerEndpoint.Address;
        var messageContent = event.Details.ContactData.Attributes.messageContent;
            
        var params = {
            //ApplicationId must match the ID of the application you created in AWS Mobile Hub
            ApplicationId: "533ae2da809e4851bad3e5bfab4bb767",
            MessageRequest: { 
                Addresses: {
                    [destinationNumber]: {
                        ChannelType: "SMS",
                        },
                    },
                    MessageConfiguration: {
                        SMSMessage: {
                            Body: messageContent,
                            MessageType: "TRANSACTIONAL",
                            SenderId: "AWS",
                        }
                    },
                }
            };
            
            // Send the SMS
            pinpoint.sendMessages(params, function(err, data) {
                if (err) {
                    console.log(err);
                    context.fail(buildResponse(false));
                }
                else  {   
                    console.log("Great Success");
                    callback(null, buildResponse(true, "none"));
                    } 
                }
            );
        };

        // Return Result to Connect
        function buildResponse(isSuccess) {
            if (isSuccess) {
                return {
                    lambdaResult: "Success"};
            }
            else {
                return { lambdaResult: "Error" };
            }
        }