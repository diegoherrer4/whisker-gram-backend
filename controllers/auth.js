import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { s3Uploadv2 } from "../middleware/s3Service.js";

// /* REGISTER USER S3 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, friends, location, sport } =
      req.body;
    console.log(req.body);
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const file = req.file; // get the uploaded file from the request

    // Upload the file to S3
    const results = await s3Uploadv2(file);
    console.log(results);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath: results.Location,
      friends,
      location,
      sport,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
