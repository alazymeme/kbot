#!/usr/bin/env node
'use strict';

const prefix = "kb ";
const custom = require('../utils/functions.js');
const fetch = require('node-fetch');
const creds = require('../credentials/config.js');

module.exports = {
	name: prefix + "hosts",
	aliases: null,
	description: `kb hosts [input] - get users that are hosting a specified channel 
	(in input), no input will return an error -- cooldown 8s`,
	permission: 0,
	cooldown: 8000,
	invocation: async (channel, user, message, args) => {
		try {

			const msg = message
				.replace(/[\u034f\u2800\u{E0000}\u180e\ufeff\u2000-\u200d\u206D]/gu, '')
				.split(" ")
				.splice(2);

			const hosts = await fetch(creds.hosts + msg[0])
				.then(response => response.json());
			const hostlist = hosts.sort().map(function(e) {

				return e.replace(/^(.{2})/, "$1\u{E0000}")
					.split("")
					.reverse()
					.join("")
					.replace(/^(.{2})/, "$1\u{E0000}")
					.split("")
					.reverse()
					.join("")
			});

			if (!msg[0]) {
				return `${user['username']}, no channel provided.`;
			}
			
			if (hosts.length < 25 && hosts.length != 0) {
				return `${user['username']}, users hosting 
				${msg[0].replace(/^(.{2})/, "$1\u{E0000}")
					.split("").reverse().join("").replace(/^(.{2})/, "$1\u{E0000}")
					.split("").reverse().join("")} PagChomp 👉 ${hostlist.join(", ")}`;
			} 
			if (hosts.length > 25) {
				return `${user['username']}, channel
				${msg[0].replace(/^(.{2})/, "$1\u{E0000}")
 					.split("").reverse().join("").replace(/^(.{2})/, "$1\u{E0000}")
 					.split("").reverse().join("")} is being hosted by ${hosts.length} users`;
			} 
			if (hosts.length === 0) {
				return `${user['username']}, channel is not being hosted by any user :(`;
			} 
			return `${user['username']}, something fucked up eShrug`;

		} catch (err) {
			custom.errorLog(err)
			const msg = message
				.replace(/[\u034f\u2800\u{E0000}\u180e\ufeff\u2000-\u200d\u206D]/gu, '')
				.split(" ")
				.splice(2);

			const fetchUrl = require("fetch").fetchUrl;
			const foo = await new Promise((resolve, reject) => {
				fetchUrl(creds.hosts + msg[0], function(error, meta, body) {
					if (error) {
						reject(error)
					} else {
						resolve(body.toString())
					}
				})
			});
			return `${user['username']}, ${foo}`
		}
	}
}