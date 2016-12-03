// Get the packages we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

var router = express.Router();
var User = require('./models/user');
var Book = require('./models/book');
var Post = require('./models/post');

mongoose.connect('mongodb://user1:password@ds117348.mlab.com:17348/proj');

app.use(cookieParser());
app.use(bodyParser.json());
//app.use(cookieParser);
app.use(session({
    secret: 'passport'
}));
app.use(passport.initialize());
app.use(passport.session());

require('./auth/passport')(passport);


// Use environment defined port or 3000
var port = process.env.PORT || 3000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));


// Use routes as a module (see index.js)
require('./routes')(app, router);

var noVar = function(variable) {
  return variable == undefined || variable == "" || variable == null;
};

var noKey = function(obj, key) {
  return !(key in obj);
};

router.route('/signup')
    .post(passport.authenticate('local-signup'), function(req, res) {
        if (noVar(req.body.name) || noVar(req.body.email) || noVar(req.body.password)) {
            res.status(500).json({message: 'Name, email, and password are required'});
        } else {
            res.status(201).json({message: 'Successfully registered user', data: {user: req.user.email}});
        }
    });
router.route('/login')
    .post(passport.authenticate('local-login'), function(req, res) {
        res.status(200).json({message: 'Successfully logged in', data: {user: req.user.email}});
    });
router.route('/logout')
    .get(function(req, res) {
        req.logOut();
        res.status(200).json({ message: "Successfully logged out "});
    });


router.route('/users')
    .get(function(req, res) {
      req.query.where = noKey(req.query, "where") ? null : JSON.parse(req.query.where.replace(/'/g,'"'));
      req.query.sort = noKey(req.query, "sort") ? null : JSON.parse(req.query.sort);
      req.query.select = noKey(req.query, "select") ? null : JSON.parse(req.query.select);
      req.query.skip = noKey(req.query, "skip") ? null : req.query.skip;
      req.query.limit = noKey(req.query, "limit") ? null : req.query.limit;
      req.query.count = noKey(req.query, "count") ? null: req.query.count;

      if (req.query.count) {
        User.find(req.query.where)
            .select(req.query.select)
            .skip(req.query.skip)
            .limit(req.query.limit)
            .sort(req.query.sort)
            .count()
            .exec(function (err, count) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              } else {
                res.status(200).json({message: 'Successfully retrieved user count', data: count});
              }
            })
      } else {
        User.find(req.query.where)
            .select(req.query.select)
            .skip(req.query.skip)
            .limit(req.query.limit)
            .sort(req.query.sort)
            .exec(function (err, user) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              } else {
                res.status(200).json({message: 'Successfully retrieved users', data: user, query: req.query});
              }
            })
      }
    })
    .post(function(req, res) {
      if (noVar(req.body.name) || noVar(req.body.email)) {
        res.status(500).json({message: 'Name and email are required'});
      } else {
        User.find({email: req.body.email}, function (err, user) {
          if (err) {
            res.status(500).json({message: 'Something went wrong'});
          } else if ((user != "" && user != null && user != undefined)) {
            res.status(500).json({message: 'This email already exists', data: user});
          } else {
            var newUser = new User();
            newUser.name = req.body.name;
            newUser.email = req.body.email;
            newUser.phone = req.body.phone;
            newUser.save(function (err, user) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              }
              else {
                res.status(201).json({message: 'Successfully created user', data: user});
              }
            });

          }
        });
      }
    })
    .options(function(req, res){
      res.writeHead(200);
      res.end();
    });

router.route('/users/:id')
    .get(function(req, res) {
      User.findById(req.params.id, function (err, user) {
        if (err) {
          res.status(500).json({message: 'Something went wrong', data: err});
        } else if (noVar(user)) {
          res.status(404).json({message: 'This user does not exist'});
        } else {
          res.status(200).json({message: 'Successfully retrieved user with id', data: user});
        }
      });
    })
    .put(function(req, res) {
      if (noVar(req.body.name) || noVar(req.body.email)) {
        res.status(500).json({message: 'Name and email are required'});
      } else {
        User.findById(req.params.id, function (err, user) {
          if (err) {
            res.status(500).json({message: 'Something went wrong', data: err});
          } else if(noVar(user)) {
            res.status(404).json({message: 'User not found'});
          } else {
            user.name = req.body.name;
            user.email = req.body.email;
            user.phone = req.body.phone;
            user.save(function(err, user) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              }
              else {
                res.status(200).json({message: 'Successfully updated user', data: user});
              }
            });
          }
        });
      }
    })
    .delete(function(req, res) {
      User.findById(req.params.id, function (err, user) {
        if (err) {
          res.status(500).json({message: 'Something went wrong', data: err});
        } else if(noVar(user)) {
          res.status(404).json({message: 'User not found'});
        } else {
          var toDelete = {_id: req.params.id};
          User.remove(toDelete, function(err) {
            if (err) {
              res.status(500).json({message: 'Something went wrong', data: err});
            }
            else {
              res.status(200).json({message: 'Successfully deleted user'});
            }
          });
        }
      });
    });


router.route('/books')
    .get(function(req, res) {
      req.query.where = noKey(req.query, "where") ? null : JSON.parse(req.query.where.replace(/'/g,'"'));
      req.query.sort = noKey(req.query, "sort") ? null : JSON.parse(req.query.sort);
      req.query.select = noKey(req.query, "select") ? null : JSON.parse(req.query.select);
      req.query.skip = noKey(req.query, "skip") ? null : req.query.skip;
      req.query.limit = noKey(req.query, "limit") ? null : req.query.limit;
      req.query.count = noKey(req.query, "count") ? null: req.query.count;

      if (req.query.count) {
        Book.find(req.query.where)
            .sort(req.query.sort)
            .select(req.query.select)
            .skip(req.query.skip)
            .limit(req.query.limit)
            .count()
            .exec(function (err, count) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              } else {
                res.status(200).json({message: 'Successfully retrieved book count', data: count});
              }
            })
      } else {
        Book.find(req.query.where)
            .sort(req.query.sort)
            .select(req.query.select)
            .skip(req.query.skip)
            .limit(req.query.limit)
            .exec(function (err, book) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              } else {
                res.status(200).json({message: 'Successfully retrieved books', data: book, query: req.query});
              }
            })
      }
    })
    .post(function(req, res) {
      if (noVar(req.body.isbn)) {
        res.status(500).json({message: 'ISBN is required'});
      } else {
          Book.findOne({'isbn': req.body.isbn}, function (err, book) {
              if (err) {
                  res.status(500).json({message: 'Something went wrong', data: err});
              } else if (book != "" && book != null && book != undefined) {
                  if (book.courses.indexOf(req.body.courses) < 0){
                      book.courses.push(req.body.courses);
                      book.save(function(err, book) {
                          if (err) {
                              res.status(500).json({message: 'Something went wrong', data: err});
                          }
                          else {
                              res.status(200).json({message: 'Successfully updated book', data: book});
                          }
                      });
                  } else {
                      res.status(304).json({message: 'nothing modified',data:[]});
                  }
              } else {
                  var newBook = new Book();
                  newBook.title = req.body.title;
                  newBook.authors = req.body.authors;
                  newBook.isbn = req.body.isbn;
                  newBook.copyrightYear = req.body.copyrightYear;
                  newBook.publisher = req.body.publisher;
                  newBook.edition = req.body.edition;
                  newBook.binding = req.body.binding;
                  newBook.image = req.body.image;
                  newBook.courses = [];
                  newBook.courses.push(req.body.courses);
                  newBook.save(function (err, book) {
                      if (err) {
                          res.status(500).json({message: 'Something went wrong', data: err});
                      }
                      else {
                          res.status(201).json({message: 'Successfully created book', data: book});
                      }
                  });
              }
          });
      }
    })
    .options(function(req, res){
      res.writeHead(200);
      res.end();
    });

router.route('/posts')
    .get(function(req, res) {
        req.query.where = noKey(req.query, "where") ? null : JSON.parse(req.query.where.replace(/'/g,'"'));
        req.query.sort = noKey(req.query, "sort") ? null : JSON.parse(req.query.sort);
        req.query.select = noKey(req.query, "select") ? null : JSON.parse(req.query.select);
        req.query.skip = noKey(req.query, "skip") ? null : req.query.skip;
        req.query.limit = noKey(req.query, "limit") ? null : req.query.limit;
        req.query.count = noKey(req.query, "count") ? null: req.query.count;

        if (req.query.count) {
            Post.find(req.query.where)
                .sort(req.query.sort)
                .select(req.query.select)
                .skip(req.query.skip)
                .limit(req.query.limit)
                .count()
                .exec(function (err, count) {
                    if (err) {
                        res.status(500).json({message: 'Something went wrong', data: err});
                    } else {
                        res.status(200).json({message: 'Successfully retrieved post count', data: count});
                    }
                })
        } else {
            Post.find(req.query.where)
                .sort(req.query.sort)
                .select(req.query.select)
                .skip(req.query.skip)
                .limit(req.query.limit)
                .exec(function (err, post) {
                    if (err) {
                        res.status(500).json({message: 'Something went wrong', data: err});
                    } else {
                        res.status(200).json({message: 'Successfully retrieved posts', data: post, query: req.query});
                    }
                })
        }
    })
    .post(function(req, res) {
        if (noVar(req.body.bookId)) {
            res.status(500).json({message: 'Book ID is required'});
        } else {
            var newPost = new Post();
            newPost.condition = req.body.condition;
            newPost.trades = [];
            for (var book in req.body.trades) {
                newPost.trades.push(book);
            }
            newPost.price = req.body.price;
            newPost.bookId = req.body.bookId;
            newPost.sellerId = req.body.sellerId;
            newPost.save(function (err, book) {
                if (err) {
                    res.status(500).json({message: 'Something went wrong', data: err});
                }
                else {
                    res.status(201).json({message: 'Successfully created post', data: book});
                }
            });
        }
    })
    .options(function(req, res){
        res.writeHead(200);
        res.end();
    });

router.route('/posts/:id')
    .get(function(req, res) {
        Post.findById(req.params.id, function (err, post) {
            if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
            } else if (noVar(post)) {
                res.status(404).json({message: 'This post does not exist'});
            } else {
                res.status(200).json({message: 'Successfully retrieved post with id', data: post});
            }
        });
    })
    .put(function(req, res) {
        if (noVar(req.body.bookId)) {
            res.status(500).json({message: 'Book ID is required'});
        } else {
            Post.findById(req.params.id, function (err, post) {
                if (err) {
                    res.status(500).json({message: 'Something went wrong', data: err});
                } else if(noVar(post)) {
                    res.status(404).json({message: 'Post not found'});
                } else {
                    post.condition = req.body.condition;
                    post.trades = req.body.trades;
                    post.price = req.body.price;
                    post.bookId = req.body.bookId;
                    post.sellerId = req.body.sellerId;
                    post.active = req.body.active;
                    post.save(function(err, post) {
                        if (err) {
                            res.status(500).json({message: 'Something went wrong', data: err});
                        }
                        else {
                            res.status(200).json({message: 'Successfully updated post', data: post});
                        }
                    });
                }
            });
        }
    })
    .delete(function(req, res) {
        Post.findById(req.params.id, function (err, post) {
            if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
            } else if(noVar(post)) {
                res.status(404).json({message: 'Post not found'});
            } else {
                var toDelete = {_id: req.params.id};
                Post.remove(toDelete, function(err) {
                    if (err) {
                        res.status(500).json({message: 'Something went wrong', data: err});
                    }
                    else {
                        res.status(200).json({message: 'Successfully deleted post'});
                    }
                });
            }
        });
    });


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
