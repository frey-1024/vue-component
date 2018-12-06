<template>
  <div class="e-calendar-wrapper">
    <div class="e-calendar">
      <div class="e-date-select">
        <div class="e-date-year">
          <transition name="fadeY">
            <div :key="selectDate.year" class="e-date-year-select" @click="openYearList" :class="{'active': showYear}">{{ selectDate.year }}</div>
          </transition>
        </div>
        <div class="e-date-monthday">
          <transition name="fadeY">
            <div :key="selectDate.day" class="e-date-monthday-select" :class="{'active': !showYear}" @click="openCalendarList"><span>{{keepDoubleDigit(selectDate.month)}}-{{keepDoubleDigit(selectDate.day)}}</span> <span>{{selectDate.weekStr}}</span></div>
          </transition>
        </div>
      </div>
      <div class="e-calendar-container" v-show="!showYear">
        <div class="e-calendar-toolbar">
          <div class="e-calendar-svg" @click="prevMonth">
            <svg viewBox="0 0 24 24" class="e-calendar-svg-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>
            <transition name="e_calendar_svg_btn">
              <div class="e-calendar-svg-cover" v-if="prevMonthClick"></div>
            </transition>
          </div>
          <div class="e-calendar-toolbar-title">
            <transition :name="fadeXType">
              <div :key="showDate.monthStr" class="e-calendar-toolbar-title-content"><strong>{{showDate.year}}</strong> <span>{{ showDate.monthStr }}</span></div>
            </transition>
          </div>
          <div class="e-calendar-svg" @click="nextMonth">
            <svg viewBox="0 0 24 24" class="e-calendar-svg-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>
            <transition name="e_calendar_svg_btn">
              <div class="e-calendar-svg-cover" v-if="nextMonthClick"></div>
            </transition>
          </div>
        </div>
        <div class="e-calendar-week">
          <span class="e-calendar-week-day">一</span>
          <span class="e-calendar-week-day">二</span>
          <span class="e-calendar-week-day">三</span>
          <span class="e-calendar-week-day">四</span>
          <span class="e-calendar-week-day">五</span>
          <span class="e-calendar-week-day">六</span>
          <span class="e-calendar-week-day">日</span>
        </div>
        <div class="e-calendar-monthday">
          <transition :name="fadeXType">
            <div :key="showDate.monthStr" class="e-calendar-monthday-wrapper">
              <div class="e-calendar-monthday-row" v-for="row in rows" >
              <span v-for="day in row"  class="e-calendar-monthday-row-day" @click="selectDay(day)" :class="{'active': day.selected, 'disabled': day.disabled, 'pointer': day.value !== ''}">
                <span v-text="day.value" class="e-calendar-monthday-row-day-value"></span>
                 <transition name="e_calendar_day">
                   <span class="e-calendar-monthday-row-day-cover" v-if="day.selected"></span>
                 </transition>
              </span>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <ul class="e-calendar-year" v-show="showYear" ref="yearList">
        <li v-for="item in yearList" v-text="item" :class="{'active': item === selectDate.year}" @click="selectYear(item)"></li>
      </ul>
      <div class="e-calendar-actions">
        <button class="btn" @click="cancel">取消</button>
        <button class="btn" @click="confirm">确定</button>
      </div>
    </div>
  </div>
</template>
<script>
  // 阿拉伯数字 转 汉字数字的基本库
  const weekJson = {
    1: '星期一',
    2: '星期二',
    3: '星期三',
    4: '星期四',
    5: '星期五',
    6: '星期六',
    7: '星期日',
  };
  const monthJson = {
    1: '一月',
    2: '二月',
    3: '三月',
    4: '四月',
    5: '五月',
    6: '六月',
    7: '七月',
    8: '八月',
    9: '九月',
    10: '十月',
    11: '十一月',
    12: '十二月',
  };
  export default {
    name: 'DatePicker',
    props: {
      // 打开date picker的初始值，必传，格式是（2017-08-11）
      date: {
        type: String,
        required: true
      },
      // 日期最小值
      minDate: {
        type: String,
        default: '1970-01-01'
      },
      // 日期最大值
      maxDate: {
        type: String,
        default: '2020-12-31'
      },
    },
    computed: {
      yearList() {
        const result = [];
        for (let i = this.copyMinDate.year; i <= this.copyMaxDate.year; i += 1) {
          result.push(i);
        }
        return result;
      },
      title() {
        // calendar 上面的所有 title 信息包括二部分
        return {
          year: '',
          monthday: '',
        };
      },
      rows() {
        const { year, month } = this.showDate;
        const months = (new Date(year, month, 0)).getDate();
        const result = [];
        let row = [];
        let weekValue;
        // 按照星期分组
        for (let i = 1; i <= months; i += 1) {
          // 根据日期获取星期，并让开头是1，而非0
          weekValue = (new Date(year, month, i)).getDay() + 1;
          // 判断月第一天在星期几，并填充前面的空白区域
          if (i === 1 && weekValue !== 1) {
            this.addRowEmptyValue(row, weekValue);
            this.addRowDayValue(row, i);
          } else {
            this.addRowDayValue(row, i);
            // 判断月最后一天在星期几，并填充后面的空白区域
            if (i === months && weekValue !== 7) {
              this.addRowEmptyValue(row, (7 - weekValue) + 1);
            }
          }
          // 按照一周分组
          if (weekValue % 7 === 0 || i === months) {
            result.push(row);
            row = [];
          }
        }
        this.showDate.monthStr = monthJson[this.showDate.month];
        return result;
      },
    },
    data() {
      return {
        selectDate: {
          year: '',
          month: '',
          day: '',
          week: '',
          date: '',
          weekStr: '',
          monthStr: '',
        }, // 选择的时间，默认是用户传的date时间
        showDate: {
          year: '',
          month: '',
          day: '',
          week: '',
          date: '',
          monthStr: '',
          weekStr: '',
        },
        copyMinDate: {
          year: '',
          month: '',
          day: '',
        },
        copyMaxDate: {
          year: '',
          month: '',
          day: '',
        },
        toolbar: '',
        fadeXType: 'fadeX_Prev',
        nextMonthClick: false,
        prevMonthClick: false,
        showYear: false,
      };
    },
    created() {
      this.initDatePicker();
    },
    methods: {
      initDatePicker() {
        this.showDate = { ...this.splitDate(this.date, true) };
        this.copyMinDate = { ...this.splitDate(this.minDate) };
        this.copyMaxDate = { ...this.splitDate(this.maxDate) };
        this.selectDate = { ...this.showDate };
      },
      splitDate(date, addStr) {
        let result = {};
        const splitValue = date.split('-');
        try {
          if (!splitValue || splitValue.length < 3) {
            throw new Error('时间格式不正确');
          }
          result = {
            year: Number(splitValue[0]),
            month: Number(splitValue[1]),
            day: Number(splitValue[2]),
          };
          if (addStr) {
            result.week = (new Date(result.year, result.month, result.day)).getDay() + 1;
            result.monthStr = monthJson[result.month];
            result.weekStr = weekJson[result.week];
          }
        } catch (error) {
          console.error(error);
        }
        return result;
      },
      addRowEmptyValue(row, count) {
        for (let w = 1; w < count; w += 1) {
          row.push({
            value: '',
          });
        }
      },
      addRowDayValue(row, i) {
        const value = { value: i };
        const { day, month, year } = this.selectDate;
        const showDate = this.showDate;
        // 判断已经选择的
        if (year === showDate.year && month === showDate.month && day === i) {
          value.selected = true;
        }
        // 当日期在最小值之外，禁止点击
        if (this.isMinLimitMonth() && i < this.copyMinDate.day) {
          value.disabled = true;
        }
        // 当日期在最大值之外，禁止点击
        if (this.isMaxLimitMonth() && i > this.copyMinDate.day) {
          value.disabled = true;
        }
        row.push(value);
      },
      /**
       * 切换到上一个月
       */
      prevMonth() {
        if (this.prevMonthClick) {
          return;
        }
        this.prevMonthClick = true;
        setTimeout(() => {
          this.prevMonthClick = false;
        }, 500);
        this.fadeXType = 'fadeX_Prev';
        // 如何当前月份已经小于等于minMonth 就不让其在执行
        if (this.isMinLimitMonth()) {
          return;
        }
        const { year, month } = this.showDate;
        // 判断当前月份，如果已经等于1（1就是一月，而不是二月）
        if (month <= 1) {
          this.showDate.year = year - 1;
          this.showDate.month = 12;
        } else {
          this.showDate.month -= 1;
        }
      },
      /**
       * 切换到下一个月
       */
      nextMonth() {
        if (this.nextMonthClick) {
          return;
        }
        this.nextMonthClick = true;
        setTimeout(() => {
          this.nextMonthClick = false;
        }, 500);
        this.fadeXType = 'fadeX_Next';
        // 如何当前月份已经大于等于maxMonth 就不让其在执行
        if (this.isMaxLimitMonth()) {
          return;
        }
        const { year, month } = this.showDate;
        // 判断当前月份，如果已经等于12（12就是十二月）
        if (month >= 12) {
          this.showDate.year = year + 1;
          this.showDate.month = 1;
        } else {
          this.showDate.month += 1;
        }
      },
      resetSelectDate(dayValue) {
        this.selectDate = { ...this.showDate };
        this.selectDate.day = dayValue;
        this.selectDate.week = (new Date(this.showDate.year, this.showDate.month, dayValue)).getDay() + 1;
        this.selectDate.weekStr = weekJson[this.selectDate.week];
      },
      selectDay(day) {
        if (day.disabled || day.selected || day.value === '') {
          return;
        }
        this.resetSelectDate(day.value);
      },
      selectYear(value) {
        this.showYear = false;
        this.showDate.year = value;
        let type;
        // 当日期在最小值之外，月份换成最小值月份 或者 当日期在最大值之外，月份换成最大值月份
        if (this.isMinLimitMonth()) {
          type = 'copyMinDate';
        } else if (this.isMaxLimitMonth()) { // 当日期在最大值之外，月份换成最大值月份
          type = 'copyMaxDate';
        }
        if (type) {
          this.showDate.month = this[type].month;
          this.showDate.day = this[type].day;
          this.resetSelectDate(this.showDate.day);
          return;
        }
        let dayValue = this.selectDate.day;
        // 判断日是最大值，防止另一个月没有这个日期
        if (this.selectDate.day > 28) {
          const months = (new Date(this.showDate.year, this.showDate.month, 0)).getDate();
          // 当前月份没有这么多天，就把当前月份最大值赋值给day
          dayValue = months < dayValue ? months : dayValue;
        }
        this.resetSelectDate(dayValue);
      },
      isMinLimitMonth() {
        return this.showDate.year <= this.copyMinDate.year && this.showDate.month <= this.copyMinDate.month;
      },
      isMaxLimitMonth() {
        return this.showDate.year >= this.copyMaxDate.year && this.showDate.month >= this.copyMaxDate.month;
      },
      openYearList() {
        if (this.showYear) {
          this.showYear = false;
          return;
        }
        const index = this.yearList.indexOf(this.selectDate.year);
        this.showYear = true;
        setTimeout(() => {
          this.$refs.yearList.scrollTop = (index - 3) * 40;
        });
      },
      openCalendarList() {
        this.showYear = false;
      },
      // 保持两位数
      keepDoubleDigit(number) {
        return number > 9 ? number : `0${number}`;
      },
      confirm() {
        const { year, month, day, week, weekStr, monthStr } = this.selectDate;
        this.$emit('confirm', {
          date: `${year}-${this.keepDoubleDigit(month)}-${this.keepDoubleDigit(day)}`,
          year,
          month,
          week,
          monthStr,
          weekStr,
          day,
        });
      },
      cancel() {
        this.$emit('cancel');
      },
    },
  };
</script>

<style lang="scss">
  @import "../../../static/styles/basic";
  @import "../../../static/styles/borderBox";
  .e-{
    &calendar-wrapper{
      position: fixed;
      left:0;
      top:0;
      bottom:0;
      right:0;
      background-color: rgba(0, 0, 0, .5);
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
    }
    &calendar{
      background-color: #ffffff;
      width: 310px;
    }
    &date-select{
      background-color: #00bcd4;
      padding: 12px 20px;
      color: #ffffff;
      font-weight: 500;
    }
    &date-year{
      font-size: 18px;
      padding-bottom: 4px;
      position: relative;
      width: 66px;
      height: 25px;
      overflow: hidden;
      &-select{
        position: absolute;
        opacity: .7;
        &.active{
          opacity: 1;
        }
      }
    }
    &date-monthday{
      font-size: 26px;
      position: relative;
      width: 100%;
      height: 36px;
      overflow: hidden;
      &-select{
        position: absolute;
        opacity: .7;
        &.active{
          opacity: 1;
        }
      }
    }
    &calendar-container{
    }
    &calendar-toolbar{
      margin: 5px 10px 5px 10px;
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &-title{
        position: relative;
        width: 100px;
        height: 22px;
        text-align: center;
        &-content{
          position: absolute;
          width: 100%;
          font-size: 16px;
        }
      }
    }
    &calendar-svg{
      padding: 8px;
      position: relative;
      height: 40px;
      width: 40px;
      &-icon{
        display: block;
        fill: currentColor;
        height: 24px;
        width: 24px;
        user-select: none;
        position: relative;
        z-index: 2;
      }
      &-cover{
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        background-color: #E0E0E0;
        border-radius: 50%;
        opacity: 0;
        display: inline-block;
      }
    }
    &calendar-week{
      width: 100%;
      font-size: 12px;
      color: rgba(0,0,0,.87);
      opacity: .5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 16px;
      &-day{
        flex: 1;
        text-align: center;
      }
    }
    &calendar-monthday{
      padding-top: 10px;
      font-size: 14px;
      position: relative;
      width: 100%;
      min-height: 210px;
      overflow: hidden;
      &-wrapper{
        position: absolute;
        width: 100%;
        height: 100%;
      }
      &-row{
        display: flex;
        justify-content: center;
        align-items: center;
        &-day{
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          position: relative;
          height: 35px;
          &.pointer{
            cursor: pointer;
          }
          &-value{
            position: relative;
            z-index: 1;
          }
          &-cover{
            width: 25px;
            height: 25px;
            background-color: #00bcd4;
            position: absolute;
            left: 10px;
            top: 5px;
            transform: translate3d(0, 0, 0);
            z-index: 0;
            border-radius: 50%;
            opacity: 1;
            display: block;
          }
          &.active{
            color: #ffffff;
          }
          &.disabled{
            opacity: .4;
            cursor: not-allowed;
          }
        }
      }
    }
    &calendar-year{
      height: 276px;
      overflow: auto;
      li{
        padding: 10px;
        text-align: center;
        font-size: 16px;
        &.active{
          color: #00bcd4;
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
    &calendar-actions{
      padding: 0 20px 15px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .btn{
        color: #00bcd4;
        margin-left: 40px;
        font-size: 16px;
        background-color: transparent;
      }
    }
  }
  .fadeX_Prev-enter-active, .fadeX_Prev-leave-active, .fadeX_Next-enter-active, .fadeX_Next-leave-active, .fadeY-enter-active, .fadeY-leave-active{
    transition: all .3s;
  }
  .fadeX_Prev-enter{
    transform: translateX(-100px);
    opacity: 0;
  }
  .fadeX_Prev-leave-active{
    transform: translateX(100px);
    opacity: 0;
  }
  .fadeX_Next-enter{
    transform: translateX(100px);
    opacity: 0;
  }
  .fadeX_Next-leave-active{
    transform: translateX(-100px);
    opacity: 0;
  }
  .fadeY-enter{
    transform: translateY(30px);
    opacity: 0;
  }
  .fadeY-leave-active{
    transform: translateY(-30px);
    opacity: 0;
  }
  .e_calendar_svg_btn-enter-active, .e_calendar_svg_btn-leave-active{
    transition: all 1s;
  }
  .e_calendar_svg_btn-enter{
    opacity: 1;
  }
  .e_calendar_day-enter-active{
      transition: all .2s;
    }
  .e_calendar_svg_btn-leave-active, .e_calendar_day-enter{
    opacity: 0;
  }
  .e_calendar_day-enter{
    width: 0;
    height: 0;
    transform: translate3d(12px, 12px, 0);
  }
</style>
