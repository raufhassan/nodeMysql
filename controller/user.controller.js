const { User } = require("../models");
const authService = require("../services/auth.service");
const { to, ReE, ReS } = require("../services/util.service");
const sgMail = require("@sendgrid/mail");
var randomstring = require("randomstring");
const { sendVerificationEmail } = require("./sendGridEmailer");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const create = async function (req, res) {
  const body = req.body;
  let token = randomstring.generate();
  console.log(body);
  if (!body.unique_key && !body.email) {
    return ReE(res, "Please enter an email to register.");
  } else if (!body.password) {
    return ReE(res, "Please enter a password to register.");
  } else {
    let err, user;
    // body.secret = randomstring.generate();
    // console.log(body.secret);
    // Create a Tutorial
    const data = {
      first: body.first,
      last: body.last,
      email: body.email,
      password: body.password,
      isVerified: false,
      secret: token,
    };

    [err, user] = await to(authService.createUser(data));

    sendVerificationEmail(body.email, token);

    // [err, user] = await to(User.create(data));

    /*  const msg = {
      to: body.email,
      from: "hassanrauf.art@gmail.com",
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };

    sgMail
      .send(msg)
      .then(() => {
        //Celebrate
        console.log("Email Sent!");
      })
      .catch((error) => {
        //Log friendly error
        console.error(error.toString());

        //Extract error msg
        const { message, code, response } = error;

        //Extract response msg
        const { headers, body } = response;
      }); */

    if (err) return ReE(res, err, 422);
    return ReS(
      res,
      {
        message: "Successfully created new user.",
        user: user.toWeb(),
        // token: user.getJWT(),
      },
      201
    );
  }
};
module.exports.create = create;

// verification function
const verification = async function (req, res) {
  User.findOne({ where: { secret: req.body.secret } }).then((user) => {
    res.json(user.isVerified);
    if (user) {
      user
        .update({ isVerified: true })
        .then(res.status(200))
        .catch((error) => {
          console.log("error", error);
        });
    }
  });
};
module.exports.verification = verification;

// login function
const login = async function (req, res) {
  const body = req.body;
  let err, user;

  [err, user] = await to(authService.authUser(req.body));
  if (err) return ReE(res, err, 422);

  User.findOne({ email: body.email });

  return ReS(res, { token: user.getJWT(), user: user.toWeb() });
};
module.exports.login = login;
