/**
 * Export and Import functionality for todos
 *
 * ⚠️ ISSUE: Uses legacy callback patterns instead of modern async/await
 * Should be refactored to use Promises and async/await
 */

const fs = require('fs');
const path = require('path');
const { db } = require('./database');

/**
 * Exports all todos to a JSON file
 * ⚠️ LEGACY: Callback hell - should use async/await
 */
function exportTodosToFile(userId, outputPath, callback) {
  // Step 1: Fetch todos from database
  fetchUserTodos(userId, function(err, todos) {
    if (err) {
      callback(err, null);
      return;
    }

    // Step 2: Convert to JSON
    convertToJson(todos, function(err, jsonData) {
      if (err) {
        callback(err, null);
        return;
      }

      // Step 3: Write to file
      writeToFile(outputPath, jsonData, function(err) {
        if (err) {
          callback(err, null);
          return;
        }

        // Step 4: Log export activity
        logExportActivity(userId, outputPath, function(err) {
          if (err) {
            callback(err, null);
            return;
          }

          callback(null, { success: true, path: outputPath });
        });
      });
    });
  });
}

/**
 * Imports todos from a JSON file
 * ⚠️ LEGACY: Nested callbacks - should use async/await
 */
function importTodosFromFile(userId, inputPath, callback) {
  // Step 1: Read file
  readFromFile(inputPath, function(err, fileContent) {
    if (err) {
      callback(err, null);
      return;
    }

    // Step 2: Parse JSON
    parseJson(fileContent, function(err, todos) {
      if (err) {
        callback(err, null);
        return;
      }

      // Step 3: Validate todos
      validateTodos(todos, function(err, validatedTodos) {
        if (err) {
          callback(err, null);
          return;
        }

        // Step 4: Save to database
        saveTodosToDb(userId, validatedTodos, function(err, result) {
          if (err) {
            callback(err, null);
            return;
          }

          // Step 5: Log import activity
          logImportActivity(userId, inputPath, result.count, function(err) {
            if (err) {
              callback(err, null);
              return;
            }

            callback(null, result);
          });
        });
      });
    });
  });
}

/**
 * Exports todos to multiple formats
 * ⚠️ LEGACY: Deeply nested callbacks
 */
function exportToMultipleFormats(userId, formats, outputDir, callback) {
  // Fetch todos first
  fetchUserTodos(userId, function(err, todos) {
    if (err) {
      callback(err, null);
      return;
    }

    // Export to JSON
    if (formats.includes('json')) {
      exportAsJson(todos, outputDir, function(err, jsonPath) {
        if (err) {
          callback(err, null);
          return;
        }

        // Export to CSV
        if (formats.includes('csv')) {
          exportAsCsv(todos, outputDir, function(err, csvPath) {
            if (err) {
              callback(err, null);
              return;
            }

            // Export to XML
            if (formats.includes('xml')) {
              exportAsXml(todos, outputDir, function(err, xmlPath) {
                if (err) {
                  callback(err, null);
                  return;
                }

                callback(null, { json: jsonPath, csv: csvPath, xml: xmlPath });
              });
            } else {
              callback(null, { json: jsonPath, csv: csvPath });
            }
          });
        } else {
          callback(null, { json: jsonPath });
        }
      });
    }
  });
}

// ❌ LEGACY: Using var instead of const/let
var EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  XML: 'xml'
};

// Helper functions with callbacks

function fetchUserTodos(userId, callback) {
  var query = 'SELECT * FROM todos WHERE user_id = $1';
  db.query(query, [userId]).then(function(rows) {
    callback(null, rows);
  }).catch(function(err) {
    callback(err, null);
  });
}

function convertToJson(data, callback) {
  try {
    var jsonString = JSON.stringify(data, null, 2);
    callback(null, jsonString);
  } catch (e) {
    callback(e, null);
  }
}

function writeToFile(filePath, content, callback) {
  fs.writeFile(filePath, content, 'utf8', callback);
}

function readFromFile(filePath, callback) {
  fs.readFile(filePath, 'utf8', callback);
}

function parseJson(jsonString, callback) {
  try {
    var data = JSON.parse(jsonString);
    callback(null, data);
  } catch (e) {
    callback(e, null);
  }
}

function validateTodos(todos, callback) {
  // Simple validation
  if (!Array.isArray(todos)) {
    callback(new Error('Invalid format: expected array'), null);
    return;
  }
  callback(null, todos);
}

function saveTodosToDb(userId, todos, callback) {
  var count = 0;
  var errors = [];

  // ❌ LEGACY: Manual iteration instead of Promise.all
  function saveNext(index) {
    if (index >= todos.length) {
      if (errors.length > 0) {
        callback(new Error('Some todos failed to save'), null);
      } else {
        callback(null, { count: count });
      }
      return;
    }

    var todo = todos[index];
    var query = 'INSERT INTO todos (user_id, title, description) VALUES ($1, $2, $3)';

    db.query(query, [userId, todo.title, todo.description])
      .then(function() {
        count++;
        saveNext(index + 1);
      })
      .catch(function(err) {
        errors.push(err);
        saveNext(index + 1);
      });
  }

  saveNext(0);
}

function logExportActivity(userId, path, callback) {
  var query = 'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)';
  db.query(query, [userId, 'export', path])
    .then(function() {
      callback(null);
    })
    .catch(callback);
}

function logImportActivity(userId, path, count, callback) {
  var query = 'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)';
  var details = path + ' (' + count + ' items)';
  db.query(query, [userId, 'import', details])
    .then(function() {
      callback(null);
    })
    .catch(callback);
}

function exportAsJson(todos, outputDir, callback) {
  var filePath = path.join(outputDir, 'todos.json');
  convertToJson(todos, function(err, jsonData) {
    if (err) {
      callback(err, null);
      return;
    }
    writeToFile(filePath, jsonData, function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, filePath);
    });
  });
}

function exportAsCsv(todos, outputDir, callback) {
  var filePath = path.join(outputDir, 'todos.csv');
  // Simple CSV conversion
  var csv = 'Title,Description,Completed\n';
  for (var i = 0; i < todos.length; i++) {
    var todo = todos[i];
    csv += '"' + todo.title + '","' + todo.description + '",' + todo.completed + '\n';
  }
  writeToFile(filePath, csv, function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, filePath);
  });
}

function exportAsXml(todos, outputDir, callback) {
  var filePath = path.join(outputDir, 'todos.xml');
  var xml = '<?xml version="1.0"?>\n<todos>\n';
  for (var i = 0; i < todos.length; i++) {
    var todo = todos[i];
    xml += '  <todo>\n';
    xml += '    <title>' + todo.title + '</title>\n';
    xml += '    <description>' + todo.description + '</description>\n';
    xml += '    <completed>' + todo.completed + '</completed>\n';
    xml += '  </todo>\n';
  }
  xml += '</todos>';
  writeToFile(filePath, xml, function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, filePath);
  });
}

module.exports = {
  exportTodosToFile,
  importTodosFromFile,
  exportToMultipleFormats
};
