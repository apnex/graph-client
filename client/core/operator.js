/*
OPERATOR provides an API for create, update, and delete of rendered shapes
It interacts directly with PAINTER and has no knowledge of ENGINEER or PLANNER
Does not directly handle DOM objects
Can handle interactivity or listener events for rendering UI visuals not yet committed to ENGINEER/MODEL
*/

// main class
import painterFactory from './painter.js';
const painter = painterFactory('canvas');

class Operator {
	constructor() {
		console.log('INIT new { OPERATOR }');
		this.state = {};
	}
	createLink(pos) {
		let id = Math.random() * 10;
		console.log('[ ENGINEER ]: createLink: SRC++ ' + pos.x + ':' + pos.y);
		return painter.createLine(id, {
			"class"		: 'link',
			"x1"		: pos.x,
			"y1"		: pos.y,
			"x2"		: pos.x,
			"y2"		: pos.y
		}, 'links');
	}
	updateLink(id, pos) {
		return painter.updateLine(id, {
			"x2"	: pos.x,
			"y2"	: pos.y
		});
	}
	deleteLink(id) {
		return painter.deleteLine(id);
	}
	createNode(id, type, pos) {
		return painter.createIcon(id, {
			"type"	: type,
			"class"	: iconset.icons[type].class.mouseout,
			"x"	: pos.x,
			"y"	: pos.y
		}, 'nodes');
	}
	updateNode(id, pos) {
		let nodes = this.state.model.nodes;
		let links = this.state.model.links;
		if(nodes[id]) {
			// render update icon
			painter.updateIcon(id, {
				"x"	: pos.x,
				"y"	: pos.y
			});
			// render update links on icon
			for(let linkId in nodes[id].links) {
				let link = links[linkId];
				if(link.src == id) {
					painter.updateLine(link.id, {
						"x1"	: pos.x,
						"y1"	: pos.y
					});
				} else {
					painter.updateLine(link.id, {
						"x2"	: pos.x,
						"y2"	: pos.y
					});
				}
			};
			return id;
		}
	}
	deleteNode(id) {
		Object.keys(nodes[id].links).forEach((linkId) => {
			painter.deleteLine(linkId);
		});
		return painter.deleteIcon(id);
	}
}

// create instance
const createInstance = function() {
	const instance = new Operator();
	return instance;
}

// export
export default createInstance;
