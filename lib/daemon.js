var fs = require("fs");
var daemon = {};
var util = {};
var pid_file_uri =  process.cwd() + "/.pid";
var pid_file = {};
var pid;

util.write = function(obj){
	fs.writeFileSync(pid_file_uri, JSON.stringify(obj));
};

try{
	pid_file = JSON.parse(fs.readFileSync(pid_file_uri, "utf8"));	
} catch (err) {
	util.write({});
}

daemon.start = function(){
	pid = process.pid;
	
	if (pid_file.pid){
		var msg = "Process " + pid_file.pid + " already running, kill this first - if the process isn't running, delete the file: " + pid_file_uri;
		console.error(msg);
		process.exit();
	} else {
		pid_file.pid = pid;
		console.log("writing pid " + JSON.stringify(pid_file));
		util.write(pid_file);
	}
	
};

daemon.stop = function() {
	
	if(pid_file.pid){
		try {
			process.kill(pid_file.pid);			
		} catch (err) {
			if (err.message !== "No such process")
				throw err;
		}
		util.write({});
		process.exit(0);
	}
	
};

daemon.parse = function(msg){
	if (msg){
		if (msg === 'start')
			daemon.start();
		else if (msg === 'stop')
			daemon.stop();
		else if (msg === 'restart')
			daemon.restart();
		else {
			console.error("Daemon doesn't understand this argument: " + msg);
			process.exit(1);
		}
	} else {
		console.error("No argument supplied for daemon");
		process.exit(1);
	}
};

daemon.restart = function(){
	daemon.stop();
	daemon.start();
};

module.exports = daemon;