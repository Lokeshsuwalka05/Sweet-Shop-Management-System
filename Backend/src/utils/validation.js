const validator = require("validator");
const validateSignupData = (data) => {
  const { firstName, lastName, emailId, password } = data;
  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid Email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter the strong password");
  } else if (!firstName) {
    throw new Error("Invalid First Name");
  } else if (!lastName) {
    throw new Error("Invalid Last Name");
  }
};
module.exports = { validateSignupData };
