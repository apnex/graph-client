class CmdHandler {
	constructor(draw) {
		console.log('INIT new { CmdHandler }');
		this.draw = draw;
	}
	cmd(msg, peer) {
		if(msg.cmd == 'log') {
			console.log('THIS IS A [ LOG ]: ' + msg.body);
		}
		if(msg.cmd == 'get') {
			console.log('THIS IS A [ GET ]: ' + msg.body);
		}
		if(msg.cmd == 'set') {
			console.log('THIS IS A [ set ]...');
			Object.assign(peer[msg.target], msg.body);
			console.log(JSON.stringify(peer, null, "\t"));
		}
		if(msg.cmd == 'action') {
			console.log('This is a [ NODE.SET ]...');
			// set class
			console.log(JSON.stringify(msg.body, null, "\t"));
		}
		if(msg.cmd == 'set-class') {
			console.log('This is a [ set-class ]...');
			if(msg.body.name) {
				let element = document.getElementById(msg.body.name);
				let currentStatus;
				if(element) {
					for(let name of element.classList.values()) {
						const regex = /^(status-[a-z0-9]+)/;
						const found = name.match(regex);
						if(found) {
							currentStatus = found[0];
						}
					}
					element.classList.replace(currentStatus, 'status-delete');
				}
			}
		}
		if(msg.cmd == 'set-class-key') { // consolidate into 'set-class-key' for dynamic values
			console.log('This is a [ set-class-key ]...');
			console.log(JSON.stringify(msg.body, null, "\t"));
			if(msg.body.name) {
				let element = document.getElementById(msg.body.name);
				this.setClassKey(element, msg.body.key, msg.body.value);
			}
		}
		if(msg.cmd == 'inform') {
			console.log('This is a [ inform ]...');
			console.log(JSON.stringify(msg.body, null, "\t"));
			let element = document.getElementById(msg.body.name);

			// update status
			if(element) {
				if(msg.body.event == 'delete') {
					this.setClassKey(element, 'status', 'delete');
					if(this.draw) {
						this.draw.deleteNode(msg.body.name);
					}
				} else {
					if(msg.body.status == 'Pending') {
						this.setClassKey(element, 'status', 'pending');
					}
					if(msg.body.status == 'Running') {
						this.setClassKey(element, 'status', 'running');
					}
				}
			}
		}
	}
	setClassKey(element, key, value) {
		let currentValue;
		let newValue = key + '-' + value;
		for(let name of element.classList.values()) {
			const regex =  new RegExp('^(' + key + '-[a-z0-9]+)');
			const found = name.match(regex);
			if(found) {
				currentValue = found[0];
			}
		};
		element.classList.replace(currentValue, newValue);
	}
}
export default CmdHandler;
