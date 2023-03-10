import Post from "../models/Post.js";
import User from "../models/User.js";
import { s3Uploadv2 } from "../middleware/s3Service.js";

/* CREATE */

export const createPost = async (req, res) => {
  try {
    console.log("request to create post");
    const { userId, description } = req.body;
    const user = await User.findById(userId);

    let picturePath;
    if (req.file) {
      // Upload the file to S3
      const results = await s3Uploadv2(req.file);
      picturePath = results.Location;
    }

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });

    await newPost.save();

    const posts = await Post.find();
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    console.log("Received request to getFeedPosts");
    const post = await Post.find();
    console.log(`Posts: ${post}`);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({
      message:
        "There was an error processing your request. Please try again later.",
      error: err.message,
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    console.log("Get user posts api call");
    const { userId } = req.params;
    const posts = await Post.find({ userId: userId });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */

export const likePost = async (req, res) => {
  try {
    console.log("Reading like post");
    const { id } = req.params;
    const { userId } = req.body;
    console.log(`UserID: ${userId}`);
    const post = await Post.findById(id);
    console.log("post:", post);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
