const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
	start: function () {
		console.log("Starting node helper: " + this.name);
	}
});
