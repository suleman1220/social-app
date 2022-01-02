const Post = require("../models/post");
const User = require("../models/user");

exports.createPost = (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  let userEmail;

  User.findById(req.userData.userId).then((user) => {
    userEmail = user.email;

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
      creatorEmail: userEmail,
    });

    post
      .save()
      .then((result) => {
        res.status(201).json({
          id: result._id,
          imagePath: result.imagePath,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Posting failed!",
        });
      });
  });
};

exports.updatePost = (req, res) => {
  let imagePath = req.body.imagePath;
  let userEmail;

  User.findById(req.userData.userId).then((user) => {
    userEmail = user.email;
  });

  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath,
    creator: req.userData.userId,
    creatorEmail: userEmail,
  });

  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({ message: "Update Successful!" });
      } else {
        res.status(401).json({ message: "Not Authorized!" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Updating post failed!",
      });
    });
};

exports.getPosts = (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const query = Post.find();
  let fetchedPosts;

  if (pageSize && currentPage) {
    query.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  query
    .then((posts) => {
      fetchedPosts = posts;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Fetching posts failed!",
      });
    });
};

exports.getPost = (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Fetching post failed!",
      });
    });
};

exports.deletePost = (req, res) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion Successful!" });
      } else {
        res.status(401).json({ message: "Not Authorized!" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Deleting post failed!",
      });
    });
};
