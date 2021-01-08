var devre = devre || {};
devre.lojikKapi = devre.lojikKapi || {};
devre.lojikKapi.bag = {
	AND2: {
		inputs: 2,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = inputs[0] && inputs[1];
		},
		getImage: function (node) {
			if (!node.image) {
				node.image = devre.lojikKapi.port.getImage("AND2");
			}
			return node.image;
		}
	},
	AND3: {
		inputs: 3,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = inputs[0] && inputs[1] && inputs[2];
		},
		getImage: function (node) {
			if (!node.image) {
				node.image = devre.lojikKapi.port.getImage("AND3");
			}
			return node.image;
		}
	},
	NAND: {
		inputs: 2,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = !(inputs[0] && inputs[1]);
		},
		getImage: function (node) {
			if(!node.image) {
				node.image = devre.lojikKapi.port.getImage("NAND");
			}
			return node.image;
		}
	},
	OR2: {
		inputs: 2,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = inputs[0] || inputs[1];
		},
		getImage: function (node) {
			if (!node.image) {
				node.image = devre.lojikKapi.port.getImage("OR2");
			}
			return node.image;
		}
	},
	OR3: {
		inputs: 3,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = inputs[0] || inputs[1] || inputs[2];
		},
		getImage: function (node) {
			if (!node.image) {
				node.image = devre.lojikKapi.port.getImage("OR3");
			}
			return node.image;
		}
	},
	
	NOR: {
		inputs: 2,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = !(inputs[0] || inputs[1]);
		},
		getImage: function (node) {
			if(!node.image) {
				node.image = devre.lojikKapi.port.getImage("NOR");
			}
			return node.image;
		}
	},
	XOR: {
		inputs: 2,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = inputs[0] ? !inputs[1] : inputs[1];
		},
		getImage: function (node) {
			if(!node.image) {
				node.image = devre.lojikKapi.port.getImage("XOR");
			}
			return node.image;
		}
	},
	XNOR: {
		inputs: 2,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = inputs[0] ? inputs[1] : !inputs[1];
		},
		getImage: function (node) {
			if(!node.image) {
				node.image = devre.lojikKapi.port.getImage("XNOR");
			}
			return node.image;
		}
	},
	NOT: {
		inputs: 1,
		outputs: 1,
		defaultOutputs: [false],
		update: function (node, inputs, time) {
			node.outputs[0] = !inputs[0];
		},
		getImage: function (node) {
			if (!node.image) {
				node.image = devre.lojikKapi.port.getImage("NOT");
			}
			return node.image;
		}
	},
	
	LIGHT: {
		inputs: 1,
		outputs: 0,
		update: function (node, inputs, time) {
			if (!node.ctx) {
				node.propertys.getImage(node);
			}
			if (node.lastInput !== inputs[0]) {
				if (inputs[0]) {
					node.ctx.beginPath();
					node.ctx.arc(25, 25, 14, 0, 2 * Math.PI);
					node.ctx.fillStyle = "rgb(233, 34, 94)";
					node.ctx.fill();
				} else {
					node.ctx.beginPath();
					node.ctx.arc(25, 25, 15, 0, 2 * Math.PI);
					node.ctx.fillStyle = "rgb(99, 55, 68)";
					node.ctx.fill();
				}
				node.lastInput = inputs[0];
			}
		},
		getImage: function (node) {
			if (!node.image) {
				var ctx = devre.lojikKapi.node.getBackground(50, 50, 5);
				ctx.beginPath();
				ctx.arc(25, 25, 15, 0, 2 * Math.PI);
				ctx.fillStyle = "rgb(99, 55, 68)";
				ctx.fill();
				node.image = ctx.canvas;
				node.ctx = ctx;
			}
			return node.image;
		}
	},
	
	LEVER: {
		inputs: 0,
		outputs: 1,
		update: function () {
		},
		getImage: function (node) {
			if (!node.image) {
				var ctx = devre.lojikKapi.node.getBackground(50, 50, 5);
				ctx.beginPath();
				ctx.rect(20, 10, 10, 30);
				ctx.fillStyle = "firebrick";
				ctx.fill();
				node.image = ctx.canvas;
				node.image.addEventListener("click", function () {
					this.outputs[0] = !this.outputs[0];
					ctx.beginPath();
					ctx.rect(20, 10, 10, 30);
					ctx.fillStyle = (this.outputs[0]) ? "#739228" : "firebrick";
					ctx.fill();
				}.bind(node));
				node.ctx = ctx;
				node.image.style.cursor = "pointer";
			}
			return node.image;
		}
	},

};
