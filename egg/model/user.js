const { STRING } = require('sequelize');
module.exports = {
	schema: {
		name: STRING(20),
	},
	options: {
		timestamps: false,
	},
};
