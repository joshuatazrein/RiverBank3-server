const jsonfile = require('jsonfile');

const path = 'data/'; // path to get data files

function readFile(username, password) {
  const data = jsonfile.readFileSync(path + username + password + '.json');
  return data;
}

function writeFile(username, password, data) {
  jsonfile.writeFileSync(path + username + password + '.json', data);
}

function updateTaskDataFile(username, password, id, value) {
  // update a single tasks's data
  const data = readFile(username, password);
  data.tasks[id] = value;
  writeFile(username, password, data);
}

function removeTaskDataFile(username, password, id) {
  // remove a single tasks' data
  const data = readFile(username, password);
  delete data.tasks[id];
  writeFile(username, password, data);
}

function uploadSettingsFile(username, password, settings) {
  // update the settings of a JSON file
  const data = readFile(username, password);
  data.settings = settings;
  writeFile(username, password, data);
}

function uploadTasksFile(username, password, tasks) {
  // update the tasks of a JSON file
  const data = readFile(username, password);
  data.tasks = tasks;
  writeFile(username, password, data);
}

module.exports = {
  readFile, 
  writeFile,
  updateTaskDataFile, 
  removeTaskDataFile, 
  uploadSettingsFile,
  uploadTasksFile
}