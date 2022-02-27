import axios from "axios";
import _ from "lodash";
import { ICountryScoreResponseData, IGlobalScoreResponseData, IMultipleUserResponseData } from "../../types/api/Score";
import { IResponseData } from "../../types/api/Response";

const API_URL = process.env.REACT_APP_API_URL;

export async function getCountryScores(countryId: number, sort: number ): Promise<IResponseData<ICountryScoreResponseData>> {
	try {
		const response = await axios.get(`${ API_URL }/scores/country/${ countryId }`, {
			params: {
				sort: sort
			}
		});

		const ret = response.data as IResponseData<ICountryScoreResponseData>;
		return ret;
	}
	catch (e) {
		let message = "Unknown error occurred.";

		if(axios.isAxiosError(e) || _.isError(e)) {
			message = e.message;
		}

		const ret: IResponseData<ICountryScoreResponseData> = {
			message: message
		};

		return ret;
	}
}

export async function getGlobalScores(sort: number): Promise<IResponseData<IGlobalScoreResponseData>> {
	try {
		const response = await axios.get(`${ API_URL }/scores`, {
			params: {
				sort: sort
			}
		});

		const ret = response.data as IResponseData<IGlobalScoreResponseData>;
		return ret;
	}
	catch (e) {
		let message = "Unknown error occurred.";

		if(axios.isAxiosError(e) || _.isError(e)) {
			message = e.message;
		}

		const ret: IResponseData<IGlobalScoreResponseData> = {
			message: message
		};

		return ret;
	}
}

export async function getMultipleUserScores(id: number[], sort: number): Promise<IResponseData<IMultipleUserResponseData>> {
	try {
		const response = await axios.get(`${ API_URL }/scores/users`, {
			params: {
				users: id,
				sort: sort
			}
		});

		const ret = response.data as IResponseData<IMultipleUserResponseData>;
		return ret;
	}
	catch (e) {
		let message = "Unknown error occurred.";

		if(axios.isAxiosError(e) || _.isError(e)) {
			message = e.message;
		}

		const ret: IResponseData<IMultipleUserResponseData> = {
			message: message
		};

		return ret;
	}
}
