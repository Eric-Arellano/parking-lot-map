import Choices from "choices.js";

import cityStatsData from "../../data/city-stats.json";
import { CityStatsCollection, DropdownChoice } from "./types";
import { CitySelectionObservable } from "./CitySelectionState";

function createDropdown(): Choices {
  const dropdown = new Choices("#city-dropdown", {
    position: "bottom",
    allowHTML: false,
    itemSelectText: "",
    searchEnabled: true,
    searchResultLimit: 6,
    searchFields: ["customProperties.city", "customProperties.state"],
    // Since cities are already alphabetical order in scorecard,
    // disabling this option allows us to show PRN maps at the top.
    shouldSort: false,
  });

  const officialCities: DropdownChoice[] = [];
  const communityCities: DropdownChoice[] = [];
  Object.entries(cityStatsData as CityStatsCollection).forEach(
    ([id, { name, contribution }]) => {
      const [city, state] = name.split(", ");
      const entry: DropdownChoice = {
        value: id,
        label: name,
        customProperties: {
          city,
          state,
        },
      };
      if (contribution) {
        communityCities.push(entry);
      } else {
        officialCities.push(entry);
      }
    },
  );

  dropdown.setChoices([
    {
      value: "Official maps",
      label: "Official maps",
      disabled: false,
      choices: officialCities,
    },
  ]);

  if (communityCities.length > 0) {
    dropdown.setChoices([
      {
        value: "Community maps",
        label: "Community maps",
        disabled: false,
        choices: communityCities,
      },
    ]);
  }

  return dropdown;
}

export default function initDropdown(
  observable: CitySelectionObservable,
): void {
  const dropdown = createDropdown();

  observable.subscribe(({ cityId }) => dropdown.setChoiceByValue(cityId));

  // Bind user-changes in the dropdown to update the state in CitySelectionObservable.
  // Note that `change` only triggers for user-driven changes, not programmatic updates.
  const selectElement = dropdown.passedElement.element as HTMLSelectElement;
  selectElement.addEventListener("change", () => {
    observable.setValue({ cityId: selectElement.value, shouldSnapMap: true });
  });
}
