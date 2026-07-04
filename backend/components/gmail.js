const params = {
  Source: process.env.AWS_Verified_Email, // Must be verified in SES
  Destination: {
    ToAddresses: ["aneg"], // Must be verified if in Sandbox
  },
  Message: {
    Subject: {
      Data: "Test Email from Node.js",
    },
    Body: {
      Text: {
        Data: "Hello! This is a simple test email sent using Node.js and Amazon SES.",
      },
      // Optional: HTML Body
      // Html: { Data: "<h1>Hello!</h1><p>This is an HTML email.</p>" }
    },
  },
};