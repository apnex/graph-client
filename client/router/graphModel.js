import PeerGroup from './peerGroup.js';
import CmdHandler from './cmdHandler.js';

class GraphModel {
	constructor(handler = new CmdHandler(), draw) {
		this.pg = new PeerGroup();
		this.handler = handler;
		this.peers = this.pg.peers;
		this.peerList = this.pg.peerList;
		this.draw = draw; // this shouldnt be here - need to turn GraphModel into an EventTarget inheritence and trigger
		console.log('WINDOW LOCATION: ' + window.location.hostname);
		this.config = {
			"name": "client01",
			"links": [
				{
					"connId": "server01",
					"host": window.location.hostname,
					"port": 8081
				}
			]
		};
		this.links = this.config.links;
		this.init();
	}
	init() {
		this.pg.addEventListener('message', (event) => {
			let message = event.detail.message;
			let peer = event.detail.peer;
			this.handler.cmd(JSON.parse(message), peer);
		});
		this.pg.addEventListener('createPeer', (event) => {
			let peer = event.detail.peer;
			let ws = event.detail.ws;

			console.log('New peer [' + peer.key + '] created!');
			ws.send(JSON.stringify({
				cmd: 'set',
				target: 'socket',
				body: {
					remote: peer.socket.local
				}
			}));

			// big hack to find nodes marked button=true
			Object.values(this.draw.model.nodes).forEach((entity) => {
				if(entity.tags.button) {
					this.handler.cmd({
						cmd: 'set-class-key',
						body: {
							name: entity.id,
							key: 'status',
							value: 'running'
						}
					});
				}
			});
		});
		this.pg.addEventListener('deletePeer', (event) => {
			let peer = event.detail.peer;
			console.log('Old peer [' + peer.key + '] deleted!');

			// loop through all nodes and set class = status-delete
			Object.values(this.draw.model.nodes).forEach((node) => {
				if(!node.tags.button) {
					this.handler.cmd({
						cmd: 'set-class-key',
						body: {
							name: node.id,
							key: 'status',
							value: 'delete'
						}
					});
				}
			});

			// big hack to find nodes marked button=true
			Object.values(this.draw.model.nodes).forEach((entity) => {
				if(entity.tags.button) {
					this.handler.cmd({
						cmd: 'set-class-key',
						body: {
							name: entity.id,
							key: 'status',
							value: 'normal'
						}
					});
				}
			});
		});

		// start control loop
		this.loop(this.config.name);
	}
	async sleep(ms) {
		return new Promise(res => setTimeout(res, ms));
	}
	async loop(name) {
		let counter = 0;
		while(1) {
			console.log('PEERS');
			let peerValues = Array.from(this.peers.values());
			console.log(JSON.stringify(peerValues, null, "\t"));
			this.pg.send(JSON.stringify({
				cmd: 'log',
				body: 'Hello! Message From LOOP CLIENT [' + name + '] !!'
			}));

			this.linkUpdate();
			await this.sleep(5000);
		}
	}
	linkUpdate() {
		this.links.forEach((link) => {
			let key = link.host + ':' + link.port;
			if(!this.peerList[key]) {
				console.log('Peer [' + key + '] does not exist - connecting');
				this.pg.create({
					key,
					url: 'ws://' + key
				});
			}
		});
	}
	createPod(id) {
		this.pg.send(JSON.stringify({
			cmd: 'createPod',
			body: {
				button: id,
				name: id
			}
		}));
	}
	deletePod(id) {
		this.pg.send(JSON.stringify({
			cmd: 'deletePod',
			body: {
				button: id,
				name: id
			}
		}));
	}
}
export default GraphModel;
