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
const Crypto = require("./model/cryptocurrency");
const Wallet = require("./model/Wallet");
//-----------------------------
const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173" }));
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
app.put("/register/user", (req, res) => {
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
        res.status(201).json(saved);
      })
      .catch((err) => {
        res.status(401).json({ err: err.message });
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
            res.status(201).json({ token: token });
          } else {
            res.status(401).json({ error: "incurect password" });
          }
        })
        .catch((error) => {
          res.status(404).json({ err: err.message });
        })
        .catch((error) => {
          res.status(404).json({ err: err.message });
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
    res.status(401).json({ errorMessage: "you most log in ^-^" });
  }
};

////-----------Update user--------------------------------
app.put("/user/update/:id", islogin, (req, res) => {
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
        res.status(404).json({ err: err.message });
      });
  });
});
//---------------delete user------------------------------
app.delete("/user/delete/:id", islogin, (req, res) => {
  const id = req.params.id;
  User.findByIdAndDelete(id)
    .then(() => {
      res.status(201).json("user deleted");
    })
    .catch(() => {
      res.status(404).json(" cant find the user :(");
    });
});
///-------Admin part--------------------------------------
app.put("/register/admin", (req, res) => {
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
        res.status(201).json(saved);
      })
      .catch((err) => {
        res.status(404).json({ err: err.message });
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
        res.status(404).json({ message: "Admin not found....!!" });
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

            res.status(201).json({ token: token });
          } else {
            res.status(404).json({ error: "incorrect password" });
          }
        })
        .catch((error) => {
          res.status(401).json({ error: err.message });
        })
        .catch((error) => {
          res.status(401).json({ error: err.message });
        });
    });
});
//-----------------update admin----------------------------
app.put("/admin/update/:id", islogin, (req, res) => {
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
        res.status(201).json("Admin updated");
      })
      .catch((error) => {
        res.status(404).json({ error: err.message });
      });
  });
});
//---------delete admin----------------------------------
app.delete("/admin/delete/:id", islogin, (req, res) => {
  const id = req.params.id;
  Admin.findByIdAndDelete(id)
    .then(() => {
      res.status(200).json("admin deleted");
    })
    .catch(() => {
      res.status(404).json(" cant find the admin :(");
    });
});
//--------------All users--------------------------------
app.get("/allusers", islogin, (req, res) => {
  User.find().then((users) => {
    res.status(200).json({ users: users });
  });
});
//-----------All admins----------------------------------
//app.get("/alladmins",islogin, (req, res) => {
// Admin.find().then((admins) => {
// res.status(200).json({ admins: admins });
//  });
//});
//-------------cryptocurrency part----------------------------
app.put("/new/crypto", islogin, (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;
  Crypto.create({
    name: name,
    description: description,
    price: price,
  })
    .then((crypto) => {
      res.status(200).json(crypto);
    })
    .catch((error) => {
      res.status(401).json(error.message);
    });
});
//------------delete cryptocurrency---------------------------------------
app.delete("/crypto/delete/:id", islogin, (req, res) => {
  const id = req.params.id;
  Crypto.findByIdAndDelete(id)
    .then(() => {
      res.status(200).json("cryptocurrency deleted");
    })
    .catch((error) => {
      res.status(404).json(error.message);
    });
});
//--------------update cryptocurrency------------------------------------
app.put("/crypto/update/:id", islogin, (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;
  Crypto.findByIdAndUpdate(id, {
    name: name,
    description: description,
    price: price,
  })
    .then(() => {
      res.status(201).json("Crypto updated");
    })
    .catch((error) => {
      res.status(404).json({ err: err.message });
    });
});
//--------------wallet part------------------------------
app.put("/new/wallet", islogin, (req, res) => {
  const balance = req.body.balance;
  const address = req.body.address;
  Wallet.create({
    balance: balance,
    address: address,
  })
    .then((Wallet) => {
      res.status(200).json(Wallet);
    })
    .catch((error) => {
      res.status(401).json(error.message);
    });
});
//---------- update wallet-------------------------------
app.put("/wallet/update/:id", islogin, (req, res) => {
  const id = req.params.id;
  const balance = req.body.balance;
  const address = req.body.address;

  Wallet.findByIdAndUpdate(id, {
    balance: balance,
    address: address,
  })
    .then(() => {
      res.status(201).json("Wallet updated");
    })
    .catch((error) => {
      res.status(404).json({ err: err.message });
    });
});
//--------------delete wallet----------------------------
app.delete("/wallet/delete/:id", islogin, (req, res) => {
  const id = req.params.id;
  Wallet.findByIdAndDelete(id)
    .then(() => {
      res.status(200).json("wallet deleted");
    })
    .catch((error) => {
      res.status(404).json(error.message);
    });
});
//-----------open port-----------------------------------
app.listen(9000, (req, res) => {
  console.log("listening");
});
