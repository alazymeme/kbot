const fs = require('fs');
const api = require('./config.js');
const options = {
	options: {
		debug: false,
	},
	connection: {
		cluster: 'aws',
	},
	identity: {
		username: 'kunszgbot',
		password: api.oauth,
	},
	channels: ['nymn', 'haxk', 'supinic', 'pajlada', 'forsen', 'xqcow', 'kunszg', 'itsgarosath', 'lulclip'],
};

const tmi = require('tmi.js');
const kb = new tmi.client(options);
const ignoreList = [
	'268612479', // titlechange_bot 
	'68136884', // Supibot 
	'229225576', // kunszgbot
	'100135110', // StreamElements 
	'122770725', // Scriptorex 
	'442600612', // Mm_sUtilityBot 
	'465732747', // charlestonbieber 
	'469718952', // wayt00dank 
	'64313471', // HuwoBot 
	'425363834', // ThePositiveBot 
	'97661864', // botnextdoor
	'413480192', // futuregadget8 
	'132134724', // gazatu2
	'62541963', // snusbot
	'82008718', // pajbot
	'27574018', // magicbot321
	'264879410', // schnozebot
	'237719657' // fossabot
];

kb.connect();
kb.on('connected', (adress, port) => {
	kb.say('kunszg', 'logger reconnected KKona')
	const mysql = require('mysql2');
	const con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: api.db_pass,
		database: "kbot",
	});
	
	con.connect(function(err) {
		if (err) {
			kb.say('kunszg', '@kunszg, database connection error monkaS')
			console.log(err)
		} else {
			console.log("Connected!");
		}
	});
	
	const doQuery = (query) => new Promise((resolve, reject) => {
	    con.query(query, (err, results, fields) => {
	        if (err) {
	        	const sql = 'INSERT INTO error_logs (error_message, date) VALUES (?, ?)';
				const insert = [JSON.stringify(err), new Date()];
				con.query(mysql.format(sql, insert),
					function(error, results, fields) {
						if (error) {
							reject(error)
						} else {
							resolve(results)
						}
					})
	            reject(err);
	        }
	        else {
	            resolve(results);
	        }      
	    });
	});

	async function kden() {
		await doQuery(`
			UPDATE memory SET memory="${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)}" WHERE module="logger"
			`)
	}
	kden()
	setInterval(() => { 
		kden()
	}, 601000)

	kb.on('message', function(channel, user, message) {
		const filterBots = ignoreList.filter(i => i === user['user-id'])
		const msg = message.replace(/[\u034f\u2800\u{E0000}\u180e\ufeff\u2000-\u200d\u206D]/gu, '')
		if (filterBots.length != 0 || msg === '') {
			return;
		} else {
			const sql = "INSERT INTO ?? (??) VALUES (?, ?, ?)";
			const collumns = ['username', 'message', 'date'];
			const inserts = ['logs_' + channel.replace('#', ''), collumns, user['username'], msg, new Date()];
			con.query(mysql.format(sql, inserts), function(error, results, fields) {
				if (error) {
					throw error
				}
			})
		}
	})

	kb.on('message', function(channel, user, message) {
		if (channel === '#xqcow') {
			return;
		}
		async function checkUser() {

			const checkIfExists = await doQuery(`SELECT username FROM user_list WHERE username="${user['username']}"`);
			if (checkIfExists.length != 0) {
				return;
			}
			const sqlUser = "INSERT INTO user_list (username, userId, channel_first_appeared, color, added) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
			const insertsUser = [user['username'], user['user-id'], channel.replace('#', ''), user['color']]
			con.query(mysql.format(sqlUser, insertsUser), function(error, results, fields) {
				if (error) {
					const errorLog = "INSERT INTO ?? (??, ??) VALUES (?, ?)";
					const errorLogCollumns = ['error_message', 'date'];
					const insertsLog = ['error_logs', errorLogCollumns, error, new Date()];
					con.query(mysql.format(errorLog, insertsLog), function(error, results, fields) {
						if (error) {
							console.log(error);
							throw error;
						}
					})
				}
			})
			
		}
		checkUser()
	})
	setInterval(async() => {
		await doQuery('UPDATE user_list SET color="gray" WHERE color IS null;')
	}, 1800000);
})