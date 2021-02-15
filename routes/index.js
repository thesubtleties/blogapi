var express = require('express');
var router = express.Router();
var Blog = require('../models/blog');
var User = require('../models/user');
var Comment = require('../models/comment');
var async = require('async');
var passport = require('passport');
var {body, validationResult} = require('express-validator');
var bcrypt = require('bcryptjs');

//make new user

router.post('/user', [
    body('email', 'Username must not be blank.').trim().isLength({ min: 1 }).escape(),
    body('password', 'Password must be at least six characters.').trim().isLength({ min: 6 }).escape(),
    (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        const errors = validationResult(req);
        var user = new User({
            email: req.body.email,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dateCreated: new Date()
        });
        if (!errors.isEmpty()) {
            res.json({
                error: errors.array()
            })
            return;
        } else {
            user.save(function(err) {
                if (err) {
                    res.json({
                        error: "error when saving"
                    })
                    return;
                } else {
                    res.send('User saved successfully.')
                }
            })
        }
    })
    }])

//get list of blogs
router.get('/blogs', function (req, res, next) {

    if (req.user === null || req.user.admin === false) {
        Blog.find({ draft: false }).sort({ datePosted: 'descending' }).populate('postedBy', 'firstName lastName').populate({path: 'comments', populate: { path: 'postedBy', select: 'firstName lastName', model: 'User' }}).exec((err, results) => {
            if (err) { return next(err); }
            res.json({
                blogPosts: results
            })
        })
    }
    else if (req.user.admin === true) {
    Blog.find().sort({ datePosted: 'descending' }).populate('postedBy', 'firstName lastName').populate({path: 'comments', populate: { path: 'postedBy', select: 'firstName lastName', model: 'User' }}).exec((err, results) => {
        if (err) { return next(err); }
        res.json({
            blogPosts: results
        })
    })
    }
});

//post new blog (really, add to list of blogs)
router.post('/blogs', [
    body('title', 'Title cannot be empty.').trim().isLength({ min: 1 }).escape(),
    body('body', 'Blog body cannot be empty.').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        if (req.user === null || req.user.admin === false) {
            res.status = 401;
            return res.send('Unauthorized');
        }
        const errors = validationResult(req);
        const post = new Blog({
            title: req.body.title,
            body: req.body.body,
            draft: (req.body.draft || true),
            datePosted: new Date(),
            postedBy: req.user._id
        })
        if (!errors.isEmpty()) {
            res.json({
                errors
            })
        } else {
            post.save((err) => {
                if (err) { res.json({
                    err
                })} else {
                    res.send('Post successful.')
                }
            })

        }
    }
]);

//get specific blog
router.get('/blogs/:id', function (req, res, next) {
    Blog.findById(req.params.id).populate('postedBy', 'firstName lastName').exec(function (err, blogPost) {
        if (err) { return next(err); }
        res.json({
            blogPost
        })

    })

});

//update specific blog
router.put('/blogs/:id', [
    body('title', 'Title cannot be empty.').trim().isLength({ min: 1 }).escape(),
    body('body', 'Body cannot be empty.').trim().isLength({ min: 1 }).escape(),
    (req, res, next) =>{

    if (req.user === null || req.user.admin === false) {
        res.status = 401;
        return res.send('Unauthorized')
    } else {
    Blog.findByIdAndUpdate({_id: req.params.id }, { title: req.body.title, body: req.body.body }, { new: true }).exec(function(err, blogPost) {
        if (err) { return res.send('Blog update failed.'); }
        else {
            res.json({
                blogPost
            })
        }
    })}}

]);

//delete one blog
router.delete('/blogs/:id', function (req, res, next) {
    if (req.user === null || req.user.admin === false) {
        res.status = 401;
        return res.send('Unauthorized.');
    }
    Blog.findByIdAndRemove(req.params.id).exec(function(err, blogPost) {
        if (err) {
            return res.send('Blog post deletion failed.')
        }
        res.send('Blog post deleted.')
    })

});

//get comments for specific blog post
router.get('/blogs/:id/comments', function (req, res, next) {
    Comment.find({ post: req.params.id }).populate('postedBy', 'firstName lastName').sort({ datePosted: 'descending' }).exec(function (err, results) {
        if (err) {
            return res.send('Error getting comments');
        } else {
            res.json({
                comments: results
            })
        }
    })

});

// add comment to blog post
router.post('/blogs/:id/comments', [
    body('body', 'Comment cannot be empty.').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        if (req.user === null) {
            return res.send('Must be logged in to comment.');
        }
        const errors = validationResult(req);
        const comment = new Comment({
            postedBy: req.user._id,
            body: req.body.body,
            datePosted: new Date(),
            post: req.params.id
        });
        if (!errors.isEmpty()) {
            return res.json({
                errors: errors.array()
            })
        } else {
            comment.save(function(err, comment) {
                if (err) {
                    return res.send('Error while saving comment.');
                } else {
                    Blog.findByIdAndUpdate({_id: req.params.id}, { $push: { comments: comment } }, { new: true }, function (err, blogPost) {
                        if (err) { return res.send('Error while saving comment.'); }
                        else {
                            res.json({
                                blogPost
                            })
                        }
                    })
                }
            })
        }
    }
]);

//Delete specific comment
router.delete('/blogs/:id/comments/:commentId', function (req, res, next) {
    if (req.user === null || req.user.admin === false) {
        return res.send('Not authorized.')
    } else {
        Comment.findByIdAndRemove(req.params.commentId).exec(function (err, comment) {
            Blog.findByIdAndUpdate({ _id: req.params.id }, { $pull: { comments: req.params.commentId }}, { new: true }, function (err, blogPost) {
                if (err) {
                    return res.send('Error deleting comment.');
                }
                else {
                    res.json({
                        blogPost
                    })
                }
            })
        })
    }

});


module.exports = router;
