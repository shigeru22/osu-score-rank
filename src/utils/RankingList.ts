import init, { search_object as searchObject } from "../wasm/pkg/osuinactivescore_wasm";
import { IRankingListData } from "../types/components/RankingList";

export function getTableRowsFromViewport() {
	const width = window.innerWidth;
	const height = window.innerHeight;

	let baseRow = 5;

	if(width <= 768) {
		baseRow = 7;
	}
	else if(width >= 1536) {
		baseRow = 9;
	}

	if(height >= 600) {
		return baseRow + Math.floor((height - 600) / 34);
	}

	return baseRow;
}

export function getTableHeight(rows: number) {
	return rows > 0 ? (rows + 1) * 34 : 0;
}

export async function searchFromTableData(data: IRankingListData[], query: string): Promise<IRankingListData[]> {
	try {
		await init();

		const result: IRankingListData[] = JSON.parse(searchObject(data, query));
		return result;
	}
	catch {
		return [];
	}
}
