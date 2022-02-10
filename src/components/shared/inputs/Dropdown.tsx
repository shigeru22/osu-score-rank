import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";
import { IDropdownData } from "../../../types/components/Dropdown";

function Dropdown({ name, label, data, value, setValue }: { name: string, label: string, data: IDropdownData[], value?: number, setValue?: React.Dispatch<React.SetStateAction<number>> }) {
	const [ isOpened, setOpened ] = useState(false);

	const refButton = useRef<HTMLButtonElement>(null);
	const refDropdown = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if(refDropdown.current && refButton.current && !refButton.current.contains(event.target as Element) && !refDropdown.current.contains(event.target as Element)) {
				setOpened(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	function toggleDropdown() {
		setOpened(!isOpened);
	}

	function handleValueChange(value: number) {
		if(!_.isUndefined(setValue)) {
			setValue(value);
		}

		setOpened(false);
	}

	function getValueFromData(value?: number) {
		if(!_.isUndefined(value)) {
			const len = data.length;
			for(let i = 0; i < len; i++) {
				if(data[i].id === value) {
					return data[i].name;
				}
			}
		}

		return "";
	}

	return (
		<div className="w-56 space-y-2">
			<label htmlFor={ name } className="font-medium text-light-80 dark:text-dark-80">{ label }</label>
			<div>
				<button type="button" id={ name } onClick={ () => toggleDropdown() } ref={ refButton } className={ `flex flex-row justify-between items-center group w-full px-3 py-1.5 ${ isOpened ? "bg-light-40 dark:bg-dark-60" : "bg-light-20 dark:bg-dark-40" } rounded-lg` }>
					<div className="font-medium text-light-100 dark:text-dark-100">{ getValueFromData(value) }</div>
					<FontAwesomeIcon icon={ faChevronDown } className={ `text-2xl pl-3 ${ isOpened ? "text-light-80 dark:text-dark-100" : "text-light-60 dark:text-dark-80 group-hover:text-light-80 dark:group-hover:text-dark-100" }` } />
				</button>
				{
					isOpened &&
					<div className="relative flex justify-center z-10">
						<div className="absolute flex flex-col w-full m-2 p-3 bg-light-20 dark:bg-dark-0 rounded-lg">
							<div ref={ refDropdown } className="max-h-26 space-y-1 overflow-y-auto">
								{
									data.map(item => (
										<div key={ item.id } onClick={ () => handleValueChange(item.id) } className={ `px-2 py-1 font-medium ${ item.id === value ? "bg-light-60 dark:bg-dark-40 text-white dark:text-dark-100" : "hover:bg-light-40 dark:hover:bg-dark-20 text-light-100 dark:text-dark-100" } rounded-lg cursor-pointer` }>{ item.name }</div>
									))
								}
							</div>
						</div>
					</div>
				}
			</div>
		</div>
	);
}

export default Dropdown;
