const admin = require("firebase-admin");

const serviceAccount = require("./music-app-96e8a-firebase-adminsdk-bnd7u-e997b2fc93.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.handler = async (event) => {
    console.log("event", JSON.stringify(event, null, 2));

    console.log("event.headers['Authorization']", event.headers["Authorization"]);

    const tokenID = event.headers && event.headers["Authorization"];

    if(!tokenID) {
        console.log("could not find a token on the event");
        return generatePolicy({ allow: false });
    } else {
        admin
        .auth()
        .verifyIdToken(tokenID)
        .then(function(){
            return generatePolicy({ allow: true });
        })
        .catch(function(err) {
            console.log(err);
            return generatePolicy({ allow: false });
        })
    }

};

const generatePolicy = ({ allow }) => {
    return {
        principalId: "token",
        policyDocument: {
            Version: "2012-10-17",
            Statement: {
                Action: "execute-api:Invoke",
                Effect: allow ? "Allow" : "Deny",
                Resource: "*",
            }
        }
    }
};