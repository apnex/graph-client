// main class
class PeerGroup extends EventTarget {
	constructor(spec = {}) {
		super();
		console.log('INIT new { PeerGroup }');
		console.log(JSON.stringify(spec, null, "\t"));
		this.peers = new Map(); // move to external Peer class?
		this.peerList = {};
	}
	send(message) {
		this.peers.forEach((metadata, peer) => {
			peer.send(message);
		});
	}
	create(spec) {
		console.log('[ peerGroup ] creating new peer [' + spec.url + ']');
		let ws = new WebSocket(spec.url);
		this.configSocket(ws);
		ws.addEventListener('open', (event) => {
			this.socketReady(ws);
		});
	}
	socketReady(ws) {
		if(ws.readyState == 1) {
			console.log('WebSocket readyState[' + ws.readyState + '] successfully connected');
			let urlTest = new URL(ws.url);
			let key = urlTest.host;
			let peer = this.createPeer(ws, key);
		}
	}
	configSocket(ws) {
		ws.addEventListener('message', (event) => {
			let peer = this.peers.get(ws);
			this.dispatchEvent(new CustomEvent('message', {
				detail: {
					peer,
					message: event.data
				}
			}));
		});
		ws.addEventListener('close', (event) => {
			console.log('WebSocket [xx] terminated');
			this.deletePeer(ws);
		});
		ws.addEventListener('error', (event) => {
			console.log('Silly connection errors');
			this.deletePeer(ws);
		});
	}
	createPeer(ws, key) {
		let peer = {
			key,
			socket: {
				local: ws.url
			}
		};
		this.dispatchEvent(new CustomEvent('createPeer', {
			detail: {
				peer,
				ws
			}
		}));
		this.peers.set(ws, peer);
		this.peerList[key] = ws;
		return peer;
	}
	deletePeer(ws) {
		if(typeof(this.peers.get(ws)) != 'undefined') {
			let peer = this.peers.get(ws);
			if(typeof(this.peerList[peer.key]) != 'undefined') {
				delete this.peerList[peer.key];
			}
			this.dispatchEvent(new CustomEvent('deletePeer', {
				detail: {
					peer,
					ws
				}
			}));
			this.peers.delete(ws);
		}
	}
}

// export
export default PeerGroup;
