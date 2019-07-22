const getTemplate = (name, url) => `
<html>
   <body>
      <p>Dear ${name},</p>
      <p>Welcome to Caleb.</p>
      <p>
      Please verify your email address to verify your account and set the password:<br/><br/>
      <a href="${url}">Verify Email</a></center>
      </p>
   </body>
</html>`;

module.exports = {
    getTemplate,
};
