const {axios} = require("./fakeBackend/mock");
const {formatDate, asyncForEach, sortByDate} = require('./utils/Functions');
const {Feedback} = require('./Model/Feedback');

const getFeedbackByProductViewData = async (product, actualize = false) => {

	try {
		const response = await axios.get(`/feedback?product=${product}`);
		let feedbacks = response.data.feedback;

		// ошибка - Отзывов пока нет
		if (feedbacks.length === 0) return new Promise(resolve => resolve({message: "Отзывов пока нет"}));

		// массив для обработанных данных
		let result = [];

		// сортировка по дате
		feedbacks.sort(sortByDate);

		//фильтр actualize
		let arr = [];
		if (actualize) {
			//группировка элементов массива по userId
			const data = feedbacks.reduce((obj, feedback) => {
				obj[feedback.userId] = [...obj[feedback.userId] || [], feedback];
				return obj;
			}, {});

			//выбор последнего по дате комментария
			for (let [key, value] of Object.entries(data)) {
				//берем последнее значение массива, т.к. он уже отсортирован по возрастанию даты
				arr.push(value[value.length - 1]);
			}
			// сортировка по дате
			arr.sort(sortByDate);
			feedbacks = arr;
		}

		await asyncForEach(feedbacks, async feedback => {
			const response = await axios.get(`/users?id=${feedback.userId}`);
			const user = response.data.users[0];
			if (user.name) {
				const resultFeedback = new Feedback(
					`${user.name} (${user.email})`,
					feedback.message,
					formatDate(new Date(feedback.date))
				);
				result.push(resultFeedback);
			}
		});

		return new Promise(resolve => resolve({feedback: result}));

	} catch (error) {
		return new Promise(resolve => resolve({message: "Такого продукта не существует"}));
	}

};

module.exports = {getFeedbackByProductViewData};
