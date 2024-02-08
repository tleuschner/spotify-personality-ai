import React from "react";
import css from "./personality.module.css";

interface PersonalityTraitsList {
  traits: string[];
}

const PersonalityTraitsList = ({ traits }: PersonalityTraitsList) => {
  return (
    <ul className={css.dashed}>
      {traits.map((trait) => (
        <li key={trait}>{trait.replace("-", "")}</li>
      ))}
    </ul>
  );
};

export default PersonalityTraitsList;
