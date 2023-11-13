const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    centreDeSoin: {
      type: mongoose.Schema.Types.ObjectId,
     },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowerCase: true,
      unique: true, // le faire au tout debut sinn il faudra supprimer toute la base pour que cela fonctionne
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("L'email est invalide");
        }
      },
    },

    enabled: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      required: true,
    },

    profession: {
      type: String,
    },
    number: {
      type: Number,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// verify credentials, this a function we use on User and not on user
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Connexion refusée");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Connexion refusée");
  }
  return user;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};
userSchema.methods.generateToken = async function () {
  const user = this;
  try {
    const token = await jwt.sign(
      { _id: user._id.toString() },
      process.env.jwt_secret
    );
    while (user.tokens.length >= 1) {
      await user.tokens.shift();
    }

    user.tokens = await user.tokens.concat({ token });

    await user.save();
    return token;
  } catch (e) {
    throw new Error("Probleme de creation d'utilisateur, "+e);
  }
};
// hash the plain text password
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
const User = mongoose.model("users", userSchema);

module.exports = User;
