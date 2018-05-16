import React, {Component} from 'react';
import PropTypes from 'prop-types';
import VirtualList from 'react-tiny-virtual-list';
import classNames from 'classnames';
import {
  emptyFn,
  getMonth,
  getWeek,
  getWeeksInMonth,
  animate,
} from '../utils';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import startOfMonth from 'date-fns/start_of_month';
import Month from '../Month';
import styles from './MonthList.scss';

const AVERAGE_ROWS_PER_MONTH = 5;
const weeksPerYear = 52.17; //(365 * 4 + 1) / (4 * 7);

/* eslint-disable react/no-deprecated */
export default class MonthList extends Component {
  static propTypes = {
    disabledDates: PropTypes.arrayOf(PropTypes.string),
    disabledDays: PropTypes.arrayOf(PropTypes.number),
    height: PropTypes.number,
    isScrolling: PropTypes.bool,
    locale: PropTypes.object,
    maxDate: PropTypes.instanceOf(Date),
    min: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    months: PropTypes.arrayOf(PropTypes.object),
    onDaySelect: PropTypes.func,
    onScroll: PropTypes.func,
    overscanMonthCount: PropTypes.number,
    rowHeight: PropTypes.number,
    selectedDate: PropTypes.instanceOf(Date),
    showOverlay: PropTypes.bool,
    theme: PropTypes.object,
    today: PropTypes.instanceOf(Date),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };
  state = {
    scrollTop: this.getDateOffset(this.props.scrollDate),
  };
  cache = {};
  memoize = function(param) {
    if (!this.cache[param]) {
      const {locale: {weekStartsOn}} = this.props;
      const [year, month] = param.split(':');
      const result = getMonth(year, month, weekStartsOn);
      this.cache[param] = result;
    }
    return this.cache[param];
  };
  monthHeights = [];

  _getRef = (instance) => { this.VirtualList = instance; }

  getMonthHeight = (index) => {
    if (!this.monthHeights[index]) {
      let {locale: {weekStartsOn}, months, rowHeight} = this.props;
      let {month, year} = months[index];
      let weeks = getWeeksInMonth(month, year, weekStartsOn, index === months.length - 1);
      let height = (weeks + 2) * rowHeight;
      this.monthHeights[index] = height;
    }

    return this.monthHeights[index];
  };

  componentDidMount() {
    this.scrollEl = this.VirtualList.rootNode;
  }

  UNSAFE_componentWillReceiveProps({scrollDate}) {
    if (scrollDate !== this.props.scrollDate) {
      this.setState({
        scrollTop: this.getDateOffset(scrollDate),
      });
    }
  }

  componentWillReceiveProps({scrollDate}) {
    if (scrollDate !== this.props.scrollDate) {
      this.setState({
        scrollTop: this.getDateOffset(scrollDate),
      });
    }
  }

  getDateOffset(date) {
    const {min, rowHeight, locale: {weekStartsOn}, height} = this.props;
    const weeks = getWeek(startOfMonth(min), parse(date), weekStartsOn);
    const months = 12 * weeks / weeksPerYear;
    const monthRows = 2 * (months - 1);

    return (weeks + monthRows) * rowHeight - (height - rowHeight / 2) / 2;
  }

  scrollToDate = (date, offset = 0, ...rest) => {
    let offsetTop = this.getDateOffset(date);
    this.scrollTo(offsetTop + offset, ...rest);
  };

  scrollTo = (scrollTop = 0, shouldAnimate = false, onScrollEnd = emptyFn) => {
    const onComplete = () => setTimeout(() => {
      this.scrollEl.style.overflowY = 'auto';
      onScrollEnd();
    });

    // Interrupt iOS Momentum scroll
    this.scrollEl.style.overflowY = 'hidden';

    if (shouldAnimate) {
      /* eslint-disable sort-keys */
      animate({
        fromValue: this.scrollEl.scrollTop,
        toValue: scrollTop,
        onUpdate: (scrollTop, callback) =>
          this.setState({scrollTop}, callback),
        onComplete,
      });
    } else {
      window.requestAnimationFrame(() => {
        this.scrollEl.scrollTop = scrollTop;
        onComplete();
      });
    }
  };

  renderMonth = ({index, style}) => {
    let {
      DayComponent,
      disabledDates,
      disabledDays,
      locale,
      maxDate,
      minDate,
      months,
      passThrough,
      rowHeight,
      selected,
      showOverlay,
      theme,
      today,
    } = this.props;

    let {month, year} = months[index];
    let key = `${year}:${month}`;
    let {date, rows} = this.memoize(key);

    const separatorStyle = {...style, height: rowHeight,
      backgroundColor: '#f0f1f3',
      paddingLeft: '18px',
      fontSize: '18px',
    };
    style = {...style, top: style.top + rowHeight};

    return (<div key={key}>
      <div style={separatorStyle}>
        {format(new Date(year, month), 'MMMM YYYY')}
      </div>
      <Month
        selected={selected}
        DayComponent={DayComponent}
        monthDate={date}
        disabledDates={disabledDates}
        disabledDays={disabledDays}
        maxDate={maxDate}
        minDate={minDate}
        rows={rows}
        rowHeight={rowHeight}
        isScrolling={false}
        showOverlay={showOverlay}
        today={today}
        theme={theme}
        style={style}
        locale={locale}
        passThrough={passThrough}
        {...passThrough.Month}
      />
    </div>);
  };

  render() {
    let {
      height,
      isScrolling,
      onScroll,
      overscanMonthCount,
      months,
      rowHeight,
      width,
    } = this.props;
    const {scrollTop} = this.state;

    return (
      <VirtualList
        ref={this._getRef}
        width={width}
        height={height}
        itemCount={months.length}
        itemSize={this.getMonthHeight}
        estimatedItemSize={rowHeight * AVERAGE_ROWS_PER_MONTH}
        renderItem={this.renderMonth}
        onScroll={onScroll}
        scrollOffset={scrollTop}
        className={classNames(styles.root, {[styles.scrolling]: isScrolling})}
        style={{lineHeight: `${rowHeight}px`}}
        overscanCount={overscanMonthCount}
      />
    );
  }
}
