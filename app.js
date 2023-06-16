const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
//------models----------------
const User = require("./model/UserModel");
const Admin = require("./model/AdminModel");
//-----------------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const saltRounds = 10;
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("connected");
  })
  .catch(() => {
    console.log(" not connected");
  });
//---------registration user api part----------------
app.post("/register/user", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds).then((encrptedPassword) => {
    User.create({
      username: username,
      email: email,
      password: encrptedPassword,
    })
      .then((saved) => {
        res.json(saved);
      })
      .catch((err) => {
        res.json({ err: err.message });
      });
  });
});
///----------login user--------------------------------
app.post("/login/user", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ username })
    .select("+password")
    .then((foundUser) => {
      if (!foundUser) {
        res.json({ message: "user not found....!!" });
        return;
      }
      const encrptedPassword = foundUser.password;
      bcrypt
        .compare(password, encrptedPassword)
        .then((response) => {
          if (response == true) {
            const token = jwt.sign(
              {
                foundUser,
              },

              process.env.JWT_SECRET,
              {
                expiresIn: "1h",
              }
            );
            res.json({ token: token });
          } else {
            res.status(401).json({ error: "incurect password" });
          }
        })
        .catch((error) => {
          res.json({ err: err.message });
        })
        .catch((error) => {
          res.json({ err: err.message });
        });
    });
});
////---------------verification of token------------------
const islogin = (req, res, next) => {
  try {
    const authheader = req.headers.authorization;
    const token = authheader.split(" ")[1];
    const object = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.object = object;
    next();
  } catch (err) {
    res.json({ errorMessage: "you most log in ^-^" });
  }
};

////-----------Update user--------------------------------
app.post("/user/update/:id", islogin, (req, res) => {
  const id = req.params.id;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password, saltRounds).then((encrptedPassword) => {
    User.findByIdAndUpdate(id, {
      username: username,
      email: email,
      password: encrptedPassword,
    })
      .then(() => {
        res.json("user updated");
      })
      .catch((error) => {
        res.json({ err: err.message });
      });
  });
});
//---------------delete user------------------------------
app.delete("/user/delete/:id", islogin, (req, res) => {
  const id = req.params.id;
  User.findByIdAndDelete(id)
    .then(() => {
      res.json("user deleted");
    })
    .catch(() => {
      res.json(" cant find the user :(");
    });
});
///-------Admin part--------------------------------------
app.post("/register/admin", (req, res) => {
  const username = "admin";
  const email = "admin@gmail.com";
  const password = "000";

  bcrypt.hash(password, saltRounds).then((encrptedPassword) => {
    Admin.create({
      username: username,
      email: email,
      password: encrptedPassword,
    })
      .then((saved) => {
        res.json(saved);
      })
      .catch((err) => {
        res.json({ err: err.message });
      });
  });
});
//-------Admin login-------------------------------------
app.post("/login/admin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  Admin.findOne({ username })
    .select("+password")
    .then((foundAdmin) => {
      if (!foundAdmin) {
        res.json({ message: "Admin not found....!!" });
        return;
      }
      const encrptedPassword = foundAdmin.password;
      bcrypt
        .compare(password, encrptedPassword)
        .then((response) => {
          if (response == true) {
            const token = jwt.sign(
              {
                foundAdmin,
              },

              process.env.JWT_SECRET,
              {
                expiresIn: "1h",
              }
            );

            res.json({ token: token });
          } else {
            res.status(401).json({ error: "incurect password" });
          }
        })
        .catch((error) => {
          res.send({ error: err.message });
        })
        .catch((error) => {
          res.send({ error: err.message });
        });
    });
});
//-----------------update admin----------------------------
app.post("/admin/update/:id", islogin, (req, res) => {
  const id = req.params.id;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password, saltRounds).then((encrptedPassword) => {
    Admin.findByIdAndUpdate(id, {
      username: username,
      email: email,
      password: encrptedPassword,
    })
      .then(() => {
        res.json("Admin updated");
      })
      .catch((error) => {
        res.json({ error: err.message });
      });
  });
});
//---------delete admin----------------------------------
app.delete("/admin/delete/:id", islogin, (req, res) => {
  const id = req.params.id;
  Admin.findByIdAndDelete(id)
    .then(() => {
      res.json("admin deleted");
    })
    .catch(() => {
      res.json(" cant find the admin :(");
    });
});
//--------------All users--------------------------------
app.get("/allusers", (req, res) => {
  User.find().then((users) => {
    res.json({ users: users });
  });
});
//-----------All admins----------------------------------
app.get("/alladmins", (req, res) => {
  Admin.find().then((admins) => {
    res.json({ admins: admins });
  });
});
//-----------open port-----------------------------------
app.listen(9000, (req, res) => {
  console.log("listening");
});
