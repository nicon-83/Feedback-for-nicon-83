const {axios} = require("./fakeBackend/mock");

const getFeedbackByProductViewData = async (product, actualize = false) => {

	try {
		const response = await axios.get(`/feedback?product=${product}`);
		return response.data;
	} catch (error) {
		if (error.status === 404) return {
			"message": "Такого продукта не существует"
		};
		return error;
	}

};

module.exports = {getFeedbackByProductViewData};
