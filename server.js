// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('./models/user');
var Task = require('./models/task');

mongoose.connect('mongodb://user1:password@ds155737.mlab.com:55737/cs498');

// Create our Express application
var app = express();

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

app.use(bodyParser.json());

// Use routes as a module (see index.js)
require('./routes')(app, router);

var noVar = function(variable) {
  return variable == undefined || variable == "" || variable == null;
};

var noKey = function(obj, key) {
  return !(key in obj);
};

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
            if (!noKey(req.body, "pendingTasks"))
              newUser.pendingTasks = req.body.pendingTasks;
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
            user.pendingTasks = req.body.pendingTasks;
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


router.route('/tasks')
    .get(function(req, res) {
      req.query.where = noKey(req.query, "where") ? null : JSON.parse(req.query.where.replace(/'/g,'"'));
      req.query.sort = noKey(req.query, "sort") ? null : JSON.parse(req.query.sort);
      req.query.select = noKey(req.query, "select") ? null : JSON.parse(req.query.select);
      req.query.skip = noKey(req.query, "skip") ? null : req.query.skip;
      req.query.limit = noKey(req.query, "limit") ? null : req.query.limit;
      req.query.count = noKey(req.query, "count") ? null: req.query.count;

      if (req.query.count) {
        Task.find(req.query.where)
            .sort(req.query.sort)
            .select(req.query.select)
            .skip(req.query.skip)
            .limit(req.query.limit)
            .count()
            .exec(function (err, count) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              } else {
                res.status(200).json({message: 'Successfully retrieved task count', data: count});
              }
            })
      } else {
        Task.find(req.query.where)
            .sort(req.query.sort)
            .select(req.query.select)
            .skip(req.query.skip)
            .limit(req.query.limit)
            .exec(function (err, user) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              } else {
                res.status(200).json({message: 'Successfully retrieved tasks', data: user, query: req.query});
              }
            })
      }
    })
    .post(function(req, res) {
      if (noVar(req.body.name) || noVar(req.body.deadline)) {
        res.status(500).json({message: 'Name and deadline are required'});
      } else {
        var newTask = new Task();
        newTask.name = req.body.name;
        if (!noKey(req.body, "description"))
          newTask.description = req.body.description;
        newTask.deadline = req.body.deadline;
        // completed = auto false
        if (!noKey(req.body, "assignedUser"))
          newTask.assignedUser = req.body.assignedUser;
        if (!noKey(req.body, "assignedUserName"))
          newTask.assignedUserName = req.body.assignedUserName;
        // dateCreated = auto

        newTask.save(function (err, task) {
          if (err) {
            res.status(500).json({message: 'Something went wrong', data: err});
          }
          else {
            res.status(201).json({message: 'Successfully created task', data: task});
          }
        });
      }
    })
    .options(function(req, res){
      res.writeHead(200);
      res.end();
    });

router.route('/tasks/:id')
    .get(function(req, res) {
      Task.findById(req.params.id, function (err, task) {
        if (err) {
          res.status(500).json({message: 'Something went wrong', data: err});
        } else if (noVar(task)) {
          res.status(404).json({message: 'This task does not exist'});
        } else {
          res.status(200).json({message: 'Successfully retrieved task with id', data: task});
        }
      });
    })
    .put(function(req, res) {
      if (noVar(req.body.name) || noVar(req.body.deadline)) {
        res.status(500).json({message: 'Name and deadline are required'});
      } else {
        Task.findById(req.params.id, function (err, task) {
          if (err) {
            res.status(500).json({message: 'Something went wrong', data: err});
          } else if(noVar(task)) {
            res.status(404).json({message: 'Task not found'});
          } else {
            task.name = req.body.name;
            if (!noKey(req.body, "description"))
              task.description = req.body.description;
            task.deadline = req.body.deadline;
            if (!noKey(req.body, "completed"))
            task.completed = req.body.completed;
            if (!noKey(req.body, "assignedUser"))
              task.assignedUser = req.body.assignedUser;
            if (!noKey(req.body, "assignedUserName"))
              task.assignedUserName = req.body.assignedUserName;
            // dateCreated = auto
            task.save(function(err, task) {
              if (err) {
                res.status(500).json({message: 'Something went wrong', data: err});
              }
              else {
                res.status(200).json({message: 'Successfully updated task', data: task});
              }
            });
          }
        });
      }
    })
    .delete(function(req, res) {
      Task.findById(req.params.id, function (err, task) {
        if (err) {
          res.status(500).json({message: 'Something went wrong', data: err});
        } else if(noVar(task)) {
          res.status(404).json({message: 'Task not found'});
        } else {
          var toDelete = {_id: req.params.id};
          Task.remove(toDelete, function(err) {
            if (err) {
              res.status(500).json({message: 'Something went wrong', data: err});
            }
            else {
              res.status(200).json({message: 'Successfully deleted task'});
            }
          });
        }
      });
    });

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
