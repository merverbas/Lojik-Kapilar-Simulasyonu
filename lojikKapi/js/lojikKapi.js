var devre = devre || {};
devre.lojikKapi = devre.lojikKapi || {};
devre.lojikKapi.port = devre.lojikKapi.port || {};
devre.lojikKapi.node = devre.lojikKapi.node || {};

devre.lojikKapi.SimpleLogic = function SimpleLogic (canvas, overlayDiv) {
	var bag = [];
	this.bag = bag;
	var canvasCtx = canvas.getContext("2d");
	this.overlayDiv = overlayDiv;
	var settings = {};
	settings.connectionWidth = 8;
	settings.connectionHeight = 10;
	if ('ontouchstart' in window || 'onmsgesturechange' in window) {
		settings.connectionWidth = 20;
		settings.connectionHeight = 20;
	}
	
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	
	this.eventHandlers = {};
	
	this.eventHandlers.mousedown = function mousedown (event) {
		if (typeof event.target.connectingInput === "number") {
			this.connecting = {node: event.target.node, input: event.target.connectingInput};
			event.preventDefault();
		} else if(typeof event.target.connectingOutput === "number") {
			this.connecting = {node: event.target.node, output: event.target.connectingOutput};
			event.preventDefault();
		} else if (!this.draggingNode && event.target.node && (typeof event.target.node.propertys.mousedown !== "function" || !event.target.node.propertys.mousedown(event))) {
			this.draggingNode = event.target;
			document.getElementById("menu").style.opacity = "0.3";
			event.target.draggingStartX = event.clientX - Math.floor(event.target.getBoundingClientRect().left);
			event.target.draggingStartY = event.clientY - Math.floor(event.target.getBoundingClientRect().top);
			event.target.dragStartTime = Date.now();
			event.preventDefault();
		} else {
			this.backStartX = event.clientX;
			this.backStartY = event.clientY;
			this.dragBackground = true;
			document.body.style.cursor = "move";
		}
	}.bind(this);
	
	this.eventHandlers.mouseup = function mouseup (event) {
		var currentX = -parseInt(overlayDiv.style.left.slice(0, -2)) + 20 || 0,
		    currentY = -parseInt(overlayDiv.style.top.slice(0, -2)) + 20  || 0;
		if (this.connecting) {
			if (typeof this.connecting.input === "number") {
				if (typeof event.target.connectingOutput === "number") {
					this.connecting.node.addInput(event.target.node, event.target.connectingOutput, this.connecting.input);
				}
			} else {
				if (typeof event.target.connectingInput === "number") {
					event.target.node.addInput(this.connecting.node, this.connecting.output, event.target.connectingInput);
				}
			}
		} else if (this.draggingNode && (this.draggingNode.node.x < currentX || this.draggingNode.node.y < currentY)) {
			this.removeNode(this.draggingNode.node);
			delete this.draggingNode;
			document.getElementById("menu").style.opacity = "";
		}
		
		// Only stop dragging if we have been dragging for more than half a second
		if (this.draggingNode && Date.now() - this.draggingNode.dragStartTime > 200) {
			delete this.draggingNode;
			document.getElementById("menu").style.opacity = "";
		}
		this.dragBackground = false;
		document.body.style.cursor = "";
		delete this.connecting;
	}.bind(this);
	
	this.eventHandlers.mousemove = function mousemove (event) {
		var returntrue;
		if (this.draggingNode && (typeof this.draggingNode.node.propertys.mousemove !== "function" || !this.draggingNode.node.propertys.mousemove(event, this.draggingNode))) {
			var x = event.clientX - Math.floor(overlayDiv.getBoundingClientRect().left) - this.draggingNode.draggingStartX,
				y = event.clientY - Math.floor(overlayDiv.getBoundingClientRect().top) - this.draggingNode.draggingStartY;
			x = Math.round(x / 10) * 10;
			y = Math.round(y / 10) * 10;
			this.draggingNode.node.x = x;
			this.draggingNode.node.y = y;
			event.preventDefault();
			returntrue = true;
		}

		if (this.connecting) returntrue = true;

		if (this.dragBackground && !this.draggingNode) {
			var currentX = parseInt(overlayDiv.style.left.slice(0, -2)) || 0,
			    currentY = parseInt(overlayDiv.style.top.slice(0, -2))  || 0;

			overlayDiv.style.left = currentX + (event.clientX - this.backStartX) + "px";
			overlayDiv.style.top  = currentY + (event.clientY - this.backStartY) + "px";

			this.backStartX = event.clientX;
			this.backStartY = event.clientY;
			
			event.preventDefault();
		}

		this.mouseX = event.clientX - Math.floor(overlayDiv.getBoundingClientRect().left);
		this.mouseY = event.clientY - Math.floor(overlayDiv.getBoundingClientRect().top);
		return returntrue;
	}.bind(this);
	
	this.eventHandlers.touchstart = function touchstart (event) {
		var ev = event.changedTouches[0];
		ev.preventDefault = function () {};
		this.eventHandlers.mousedown(ev);
	}.bind(this);
	
	this.eventHandlers.touchend = function touchend (event) {
		var ev = {
			clientX: event.changedTouches[0].clientX,
			clientY: event.changedTouches[0].clientY
		};
		ev.preventDefault = function () {};
		ev.target = document.elementFromPoint(ev.clientX, ev.clientY);
		this.eventHandlers.mouseup(ev);
	}.bind(this);
	
	this.eventHandlers.touchmove = function touchmove (event) {
		var ev = event.changedTouches[0];
		ev.preventDefault = function () {};
		if (this.eventHandlers.mousemove(ev)) {
			event.preventDefault();
		}
	}.bind(this);;
	
	document.addEventListener("mousedown", this.eventHandlers.mousedown);
	document.addEventListener("mouseup", this.eventHandlers.mouseup);
	document.addEventListener("mousemove", this.eventHandlers.mousemove);
	document.addEventListener("touchstart", this.eventHandlers.touchstart);
	document.addEventListener("touchend", this.eventHandlers.touchend);
	document.addEventListener("touchmove", this.eventHandlers.touchmove);

	this.update = function () {
		var updateTime = Date.now();
		for (var node = 0; node < bag.length; node++) {
			if (!bag[node].lastUpdate || bag[node].lastUpdate < updateTime) {
				bag[node].update(updateTime);
			}
		}
	};
	
	this.addNode = function (type, x, y) {
		var node = new devre.lojikKapi.Node({
			type: type,
			x: x,
			y: y
		});
		bag.push(node);
		return node;
	};
	
	this.removeNode = function (node) {
		for (var k = 0; k < bag.length; k++) {
			if (bag[k] === node) {
				var div = document.getElementById(bag[k].id);
				if (div) {
					div.parentNode.removeChild(div);
				}
				bag.splice(k, 1);
				k--;
			} else {
				bag[k].removeInput(node);
			}
		}
		delete this.draggingNode;
	};

	this.inputCoords = function inputCoords (node, input) {
		var image = node.propertys.getImage(node);
		var height = (image.height - node.propertys.inputs * settings.connectionHeight) / (node.propertys.inputs + 1);
		var x = node.x - 2,
			y = node.y + height * (input + 1) + input * settings.connectionHeight + settings.connectionHeight / 2;
		return [x, y];
	};

	this.outputCoords = function outputCoords (node, output) {
		var image = node.propertys.getImage(node);
		var height = (image.height - node.propertys.outputs * settings.connectionHeight) / (node.propertys.outputs + 1);
		var x = node.x + image.width + 2,
			y = node.y + height * (output + 1) + output * settings.connectionHeight + settings.connectionHeight / 2;
		return [x, y];
	};

	this.draw = function () {
		canvas.width = this.canvasWidth;
		canvas.height = this.canvasHeight;
		canvasCtx.lineWidth = "5";
		for (var k = 0; k < bag.length; k++) {
			var div = document.getElementById(bag[k].id);
			if (!div) {
				div = overlayDiv.appendChild(this.domElementOfNode(bag[k]));
			}
			div.style.position = "absolute";
			div.style.left = bag[k].x + "px";
			div.style.top = bag[k].y + "px";
			
			for (var i = 0; i < bag[k].inputs.length; i++) {
				if (bag[k].inputs[i]) {
					var inputCoords = this.inputCoords(bag[k], i);
					var outputCoords = this.outputCoords(bag[k].inputs[i].node, bag[k].inputs[i].number);
					canvasCtx.beginPath();
					canvasCtx.moveTo(inputCoords[0], inputCoords[1]);
					canvasCtx.lineTo(outputCoords[0], outputCoords[1]);
					this.canvasWidth = Math.max(this.canvasWidth, Math.max(inputCoords[0], outputCoords[0]));
					this.canvasHeight = Math.max(this.canvasHeight, Math.max(inputCoords[1], outputCoords[1]));
					canvasCtx.strokeStyle = (bag[k].inputs[i].node.outputs[bag[k].inputs[i].number]) ? "rgb(55, 173, 50)" : "rgb(75, 37, 37)";
					canvasCtx.stroke();
				}
			}
		}
		
		if (this.connecting) {
			canvasCtx.beginPath();
			if (typeof this.connecting.output === "number") {
				var coords = this.outputCoords(this.connecting.node, this.connecting.output);
			} else {
				var coords = this.inputCoords(this.connecting.node, this.connecting.input);
			}
			canvasCtx.moveTo(coords[0], coords[1]);
			canvasCtx.lineTo(this.mouseX, this.mouseY);
			this.canvasWidth = Math.max(this.canvasWidth, Math.max(coords[0], this.mouseX));
			this.canvasHeight = Math.max(this.canvasHeight, Math.max(coords[1], this.mouseY));
			canvasCtx.lineWidth = "5";
			canvasCtx.strokeStyle = "rgb(44, 156, 143)";
			canvasCtx.stroke();
		}
	};
	
	this.domElementOfNode = function (node) {
		var div = document.createElement("div");
		div.id = node.id;
		div.className = "nodeContainer";
		
		image = div.appendChild(node.propertys.getImage(node));
		image.node = node;
		image.className = "draw_node position_node";
		image.id = node.id + "_image";
		
		var height = (image.height - node.propertys.inputs * settings.connectionHeight) / (node.propertys.inputs + 1);
		for (var i = 0; i < node.propertys.inputs; i++) {
			var input = document.createElement("div");
			input.className = "draw_connect_div";
			input.style.position = "absolute";
			input.style.height = settings.connectionHeight + "px";
			input.style.width = settings.connectionWidth + "px";
			input.style.left = -settings.connectionWidth + "px";
			input.style.top = height * (i + 1) + i * settings.connectionHeight + "px";
			input.node = node;
			input.connectingInput = i;
			input.addEventListener("click", function (number, event) {
				event.target.node.removeInput(number);
			}.bind(this, i));
			div.appendChild(input);
		}
		
		var height = (image.height - node.propertys.outputs * settings.connectionHeight) / (node.propertys.outputs + 1);
		for (var i = 0; i < node.propertys.outputs; i++) {
			var input = document.createElement("div");
			input.className = "draw_connect_div";
			input.style.position = "absolute";
			input.style.height = settings.connectionHeight + "px";
			input.style.width = settings.connectionWidth + "px";
			input.style.left = image.width + 2 + "px";
			input.style.top = height * (i + 1) + i * settings.connectionHeight + "px";
			input.node = node;
			input.connectingOutput = i;
			input.addEventListener("click", function (number, event) {
				this.removeConnectionsFromOutput(event.target.node, number);
			}.bind(this, i));
			div.appendChild(input);
		}
		
		return div;
	};
	
	this.removeConnectionsFromOutput = function removeConnections (node, number) {
		for (var k = 0; k < bag.length; k++) {
			bag[k].removeInput(node, number);
		}
	};
	
	this.nodeFromId = function (id) {
		for (var k = 0; k < bag.length; k++) {
			if (bag[k].id === id) {
				return bag[k];
			}
		}
		console.log("Node '" + id + "' not found.");
		return {};
	};

	this.addModuleClickListener = function clicklistener (event) {
		if (event.changedTouches) {
			event = event.changedTouches[0];
		}
		if (Date.now() - document.addingModuleTime < 5) {
			return;
		}
		this.loadFromJSON(document.addingModule, event.clientX - Math.floor(overlayDiv.getBoundingClientRect().left), event.clientY - Math.floor(overlayDiv.getBoundingClientRect().top));
		document.addingModule = "[]";
		document.getElementById("clickHelp").style.display = "none";
	}.bind(this);
	
	this.tick = function () {
		this.update();
		this.draw();
		requestAnimationFrame(this.tick);
	}.bind(this);
	
	requestAnimationFrame(this.tick);
};

devre.lojikKapi.Node = function Node (settings) {
	settings = settings || {};
	if (!devre.lojikKapi.bag[settings.type]) {
		throw "Unknown node type";
	}
	
	this.propertys = devre.lojikKapi.bag[settings.type];
	this.propertys.type = settings.type;
	
	this.inputNodes = {length: this.propertys.inputs};
	this.inputs = this.inputNodes;
	this.outputs = [];
	for (var k = 0; k < this.propertys.defaultOutputs; k++) {
		this.outputs[k] = this.propertys.defaultOutputs[k];
	}
	
	this.lastUpdated = Date.now();
	this.x = settings.x;
	this.y = settings.y;
	this.id = settings.type + "_" + Date.now();
	
	this.getInputs = function getInputs (time) {
		var inputs = [];
		for (var k = 0; k < this.propertys.inputs; k++) {
			if (this.inputNodes[k]) {
				if (this.inputNodes[k].lastUpdate < time) {
					this.inputNodes[k].update(time);
				}
				inputs[k] = this.inputNodes[k].node.outputs[this.inputNodes[k].number];
			} else {
				inputs[k] = false;
			}
		}
		return inputs;
	};
	
	this.update = function (time) {
		this.lastUpdated = time;
		var inputs = this.getInputs(time);
		this.propertys.update(this, inputs, time);
	};
	
	this.addInput = function (node, nodeOutputNumber, inputNodeNumber) {
		this.inputNodes[inputNodeNumber] = {
			node: node,
			number: nodeOutputNumber
		};
	};
	
	this.removeInput = function (node, outputNumber) {
		if (typeof node !== "number") {
			for (var k = 0; k < this.inputNodes.length; k++) {
				if (this.inputNodes[k] && this.inputNodes[k].node == node && (typeof outputNumber !== "number" || this.inputNodes[k].number === outputNumber)) {
					delete this.inputNodes[k];
				}
			}
		} else {
			delete this.inputNodes[node];
		}
	};
};

devre.lojikKapi.node.getBackground = function (width, height, border) {
	var ctx = devre.utils.newCtx(width, height, "steelblue");
	ctx.beginPath();
	ctx.fillStyle = "rgb(55, 55, 55)";
	ctx.rect(border, border, width - border - border, height - border - border);
	ctx.fill();
	return ctx;
};

devre.lojikKapi.port.getImage = function (text) {
	var width = 12 * text.length + 32,
		height = 50;
	var border = 5;
	var ctx = devre.lojikKapi.node.getBackground(width, height, border);
	devre.lojikKapi.port.textOnImage(ctx, text, border, height);
	return ctx.canvas;
};

devre.lojikKapi.port.textOnImage = function (ctx, text, border, height) {
	ctx.beginPath();
	ctx.font="20px 'Coda Caption'";
	ctx.fillStyle = "rgb(255, 255, 200)";
	ctx.fillText(text, border + border, height / 2 + 8);
};