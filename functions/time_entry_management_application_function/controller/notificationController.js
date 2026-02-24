const catalyst = require("zcatalyst-sdk-node");

module.exports = async (req, res) => {
    const catalystApp = catalyst.initialize(req); // Correct way to initialize
   

    const email = req.body.email;

    const message = {
        recipients: [email],
        channel: "email", // Use "email" here if sending an email
        subject: "New Task",
        message: "You have been assigned a new task."
    };

    try {
        const result = await catalystApp.pushNotification().web().sendNotification(message.message); // Use sendMail for email
        res.status(200).send({ success: true, result });
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
};
