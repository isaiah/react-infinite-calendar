import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { scrollbarSize } from "../utils";
import styles from "./Weekdays.scss";

export default class Weekdays extends PureComponent {
  static propTypes = {
    locale: PropTypes.object,
    theme: PropTypes.object
  };

  render() {
    const { weekdays, weekStartsOn, theme, style } = this.props;
    const orderedWeekdays = [
      ...weekdays.slice(weekStartsOn, 7),
      ...weekdays.slice(0, weekStartsOn)
    ];

    return (
      <ul
        className={styles.root}
        style={{
          backgroundColor: theme.weekdayBackground,
          color: theme.weekdayColor,
          paddingRight: scrollbarSize,
          ...style
        }}
        aria-hidden={true}
      >
        {orderedWeekdays.map((val, index) => (
          <li key={`Weekday-${index}`} className={styles.day}>
            {val}
          </li>
        ))}
      </ul>
    );
  }
}
