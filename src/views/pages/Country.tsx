import React, { useState, useRef, useEffect, useContext } from "react";
import _ from "lodash";
import StatsCard from "../../components/shared/StatsCard";
import RankingList from "../../components/shared/RankingList";
import Pagination from "../../components/shared/Pagination";
import TextInput from "../../components/shared/inputs/Text";
import Dropdown from "../../components/shared/inputs/Dropdown";
import SearchButton from "../../components/shared/mobile/SearchButton";
import DimBackground from "../../components/shared/DimBackground";
import ProfileDialog from "../../components/shared/ProfileDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCircleNotch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { settingsContext } from "../App";
import { getCountryIndexById, getRankingListTotalPages } from "../../utils/Number";
import { getTableRowsFromViewport, getTableHeight, searchFromTableData } from "../../utils/RankingList";
import { sortOptions } from "../../utils/Options";
import { getCountryScores } from "../../utils/api/Scores";
import { IRankingListData } from "../../types/components/RankingList";
import { Settings as SettingsData } from "../../types/context/Settings";

function Country() {
	const { settings, logs, countries, activeCountryId, setSettings, addLogData } = useContext(settingsContext);

	const [ starredUsers, setStarredUsers ] = useState(settings.starredUserId);

	const [ showProfileDialog, setShowProfileDialog ] = useState(false);
	const [ selectedUserId, setSelectedUserId ] = useState(0);

	const [ showErrorDialog, setShowErrorDialog ] = useState(true);

	const [ searchQuery, setSearchQuery ] = useState("");
	const [ selectedSortId, setSelectedSortId ] = useState(settings.defaultSortingId);
	const [ tableRowsPerPage, setTableRowsPerPage ] = useState(getTableRowsFromViewport());

	const [ updateDebounce, setUpdateDebounce ] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
	const [ searchDebounce, setSearchDebounce ] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);

	const [ isLoading, setLoading ] = useState(true);

	const [ rankingPage, setRankingPage ] = useState(1);
	const [ rankingData, setRankingData ] = useState<IRankingListData[]>([]);
	const [ rankingDataResults, setRankingDataResults ] = useState<IRankingListData[]>([]);
	const [ displayedRankingData, setDisplayedRankingData ] = useState<IRankingListData[]>([]);

	const [ recentlyInactive, setRecentlyInactive ] = useState(0);
	const [ totalInactives, setTotalInactives ] = useState(0);

	const refUserDialog = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if(_.isEmpty(searchQuery)) {
			setRankingDataResults(rankingData);
			return;
		}

		if(!_.isUndefined(searchDebounce)) {
			clearTimeout(searchDebounce);
		}

		setSearchDebounce(setTimeout(async () => {
			addLogData("Info", "searchDebounce timeout reached. Searching data...");

			const result = await searchFromTableData(rankingData, searchQuery);
			setRankingDataResults(result);
			setRankingPage(1);
		}, 250));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ searchQuery ]);

	useEffect(() => {
		function updateWindowDimensions() {
			if(!_.isUndefined(updateDebounce)) {
				clearTimeout(updateDebounce);
			}

			setUpdateDebounce(setTimeout(() => {
				addLogData("Info", "updateDebounce timeout reached. Updating display row count...");

				const before = tableRowsPerPage;
				const after = getTableRowsFromViewport();

				if(before !== after) {
					setRankingPage(1);
					setTableRowsPerPage(getTableRowsFromViewport());
				}
			}, 200));
		}

		window.addEventListener("resize", updateWindowDimensions);

		return () => {
			window.removeEventListener("resize", updateWindowDimensions);
		};

	/* tableRowsPerPage should not be its dependency */
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ updateDebounce ]);

	useEffect(() => {
		const temp: IRankingListData[] = [];
		for(let i = (rankingPage - 1) * tableRowsPerPage; i < rankingPage * tableRowsPerPage; i++) {
			temp.push(rankingDataResults[i]);
		}

		setDisplayedRankingData(temp);

		if(!_.isUndefined(updateDebounce)) {
			clearTimeout(updateDebounce);
			setUpdateDebounce(undefined);
		}

	/* updateDebounce should not be its dependency */
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ rankingPage, rankingDataResults, tableRowsPerPage ]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if(refUserDialog.current && !refUserDialog.current.contains(event.target as Element)) {
				setShowProfileDialog(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		async function getScores() {
			const scores = await getCountryScores(activeCountryId, selectedSortId);

			if(!_.isUndefined(scores.data)) {
				const temp = scores.data.rankings.map((item, index) => ({
					id: item.scoreId,
					rank: index + 1,
					userName: item.user.userName,
					score: _.isNumber(item.score) ? item.score : _.parseInt(item.score, 10),
					pp: item.pp,
					delta: item.delta
				}));

				setRankingData(temp);

				/* since this effect is run at page load, set as filtered data */
				setRankingDataResults(temp);

				setRecentlyInactive(scores.data.inactives.recentlyInactive);
				setTotalInactives(scores.data.total);

				addLogData("Info", "Fetch country ranking success.");
			}
			else {
				addLogData("Error", `Fetch country ranking failed: ${ scores.message }`);
			}

			setLoading(false);
		}

		addLogData("Info", "Fetching country ranking data...");
		setLoading(true);
		getScores();

	/* addLogData should not be its dependency */
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activeCountryId, selectedSortId ]);

	function handleUserClick(id: number) {
		setSelectedUserId(id);
		setShowProfileDialog(true);
	}

	function handleUserStarClick() {
		const newSettings: SettingsData = {
			themeId: settings.themeId,
			dateFormatId: settings.dateFormatId,
			defaultCountryId: settings.defaultCountryId,
			defaultSortingId: settings.defaultSortingId,
			starredUserId: settings.starredUserId
		};

		if(_.indexOf(settings.starredUserId, selectedUserId) < 0) {
			newSettings.starredUserId.push(selectedUserId);
		}
		else {
			newSettings.starredUserId = _.filter(newSettings.starredUserId, id => id !== selectedUserId);
		}

		setSettings(newSettings);
		setStarredUsers([ ...newSettings.starredUserId ]);

		addLogData("Info", `Added user ID ${ selectedUserId } to starred users list.`);
	}

	function getCountryName() {
		const index = getCountryIndexById(countries, activeCountryId);
		return !_.isUndefined(countries[index]) ? countries[index].name : "";
	}

	return (
		<div className="px-0 py-0 md:px-14 md:py-8 lg:py-12 md:space-y-6">
			<div className="hidden md:block space-y-6">
				<div className="md:flex justify-between items-start">
					<h1 className="font-semibold text-3xl text-light-100 dark:text-dark-100">{ getCountryName() }</h1>
					<h2 className="font-semibold text-light-60 dark:text-dark-80">Last updated: 2022/01/27</h2>
				</div>
			</div>
			<div className="2xl:flex 2xl:justify-between 2xl:gap-x-16 gap-y-6 space-y-6 2xl:space-y-0">
				<div className="flex flex-col gap-y-6">
					<h3 className="px-8 pt-2 md:px-0 md:py-0 font-semibold text-2xl text-light-100 dark:text-dark-100">Statistics</h3>
					<div className="flex 2xl:flex-col items-start gap-x-4 gap-y-4 px-8 md:px-0 overflow-x-auto">
						<StatsCard title="Recently Inactive" data={ recentlyInactive.toString() } subtitle="+ 1 since last month" />
						<StatsCard title="Total Inactives" data={ totalInactives.toString() } subtitle="+ 2 since last month" />
					</div>
				</div>
				<div className="2xl:flex-grow flex flex-col md:flex-row items-start gap-x-6 gap-y-4">
					<div className="flex md:hidden justify-between items-center w-full px-8">
						<Dropdown name="sort" label="Sort" data={ sortOptions } value={ selectedSortId } setValue={ setSelectedSortId } />
						<SearchButton value={ searchQuery } setValue={ setSearchQuery } />
					</div>
					<div className="flex-grow flex flex-col md:items-left gap-y-4 w-full md:w-auto">
						<h3 className="hidden 2xl:block self-start text-left font-semibold text-2xl text-light-100 dark:text-dark-100">Rankings</h3>
						{
							rankingDataResults.length > 0 ?
								<>
									<div className="flex 2xl:flex-col items-start px-8 md:px-0 overflow-x-auto" style={ { minHeight: getTableHeight(tableRowsPerPage) } }> { /* calculate table height programatically */ }
										<RankingList data={ displayedRankingData } onUserClick={ handleUserClick } />
									</div>
									<div className="hidden md:flex justify-center w-full">
										<Pagination active={ rankingPage } total={ getRankingListTotalPages(rankingDataResults, tableRowsPerPage) } setValue={ setRankingPage } />
									</div>
									{
										showProfileDialog &&
										<DimBackground>
											<ProfileDialog htmlRef={ refUserDialog } userId={ selectedUserId } starred={ _.indexOf(starredUsers, selectedUserId) >= 0 } onCloseClick={ () => setShowProfileDialog(false) } onStarClick={ () => handleUserStarClick() } />
										</DimBackground>
									}
								</>
								:
								<div className="flex justify-center items-center w-full h-full" style={ { height: getTableHeight(getTableRowsFromViewport()) } }>
									<div className="flex flex-col justify-center items-center gap-y-2">
										<FontAwesomeIcon icon={ isLoading ? faCircleNotch : faTimes } className={ `text-5xl text-light-60 dark:text-dark-80 ${ isLoading && "animate-spin" }` } />
										<div className="font-medium text-center text-light-60 dark:text-dark-80 whitespace-pre">
											{
												isLoading ? "Loading data..." : "Failed to fetch data.\nTry refreshing the page."
											}
										</div>
									</div>
								</div>
						}
					</div>
					<div className="hidden md:flex 2xl:hidden flex-col gap-y-4 pt-1.25">
						<TextInput name="search" label="Search player" icon={ faSearch } value={ searchQuery } setValue={ setSearchQuery } />
						<Dropdown name="sort" label="Sort" data={ sortOptions } value={ selectedSortId } setValue={ setSelectedSortId } />
					</div>
					<div className="flex justify-center md:hidden w-full">
						<Pagination active={ rankingPage } total={ getRankingListTotalPages(rankingDataResults, tableRowsPerPage) } setValue={ setRankingPage } />
					</div>
				</div>
				<div className="hidden 2xl:flex flex-col gap-y-4 pt-13">
					<TextInput name="search" label="Search player" icon={ faSearch } value={ searchQuery } setValue={ setSearchQuery } />
					<Dropdown name="sort" label="Sort" data={ sortOptions } value={ selectedSortId } setValue={ setSelectedSortId } />
				</div>
			</div>
		</div>
	);
}

export default Country;
