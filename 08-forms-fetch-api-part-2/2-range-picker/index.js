export default class RangePicker {
  element = null;
  subElements = [];
  selectingFrom = true;
  selected = {
    from: new Date(),
    to: new Date(),
  };

  static formatDate(date) {
    return date.toLocaleString("ru", { dateStyle: "short" });
  }

  constructor({ from = new Date(), to = new Date() } = {}) {
    this.dateFrom = new Date(from);
    this.selected = { from, to };
    this.render();
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  get template() {
    const from = RangePicker.formatDate(this.selected.from);
    const to = RangePicker.formatDate(this.selected.to);
    return `
	  <div class="rangepicker">
		<div class="rangepicker__input" data-element="input">
			<span data-element="from">${from}</span> -
			<span data-element="to">${to}</span>
		</div>
		<div class="rangepicker__selector" data-element="selector"></div>
	  </div>
	  `;
  }

  getSubElements(element) {
    const dataElements = element.querySelectorAll("[data-element]");
    return [...dataElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  initEventListeners() {
    const { input, selector } = this.subElements;
    document.addEventListener("click", this.onDocumentClick, true);
    input.addEventListener("click", this.onToggleInput.bind(this));
    selector.addEventListener("click", (event) => this.onSelectorClick(event));
  }

  onDocumentClick = (event) => {
    const isOpenElem = this.element.classList.contains("rangepicker_open");
    const isCalendar = this.element.contains(event.target);
    if (isOpenElem && !isCalendar) {
      this.close();
    }
  };

  onToggleInput() {
    this.element.classList.toggle("rangepicker_open");
    this.renderDatePicker();
  }

  onSelectorClick({ target }) {
    if (target.classList.contains("rangepicker__cell")) {
      this.onRangePickerCellClick(target);
    }
  }

  close() {
    this.element.classList.remove("rangepicker_open");
  }

  renderDatePicker() {
    const { selector } = this.subElements;
    const showDateOne = new Date(this.dateFrom);
    const showDateSecond = new Date(this.dateFrom);

    showDateSecond.setMonth(showDateSecond.getMonth() + 1);
    selector.innerHTML = `
	  <div class="rangepicker__selector-arrow"></div>
	  <div class="rangepicker__selector-control-left"></div>
	  <div class="rangepicker__selector-control-right"></div>
	  ${this.renderCalendar(showDateOne)}
	  ${this.renderCalendar(showDateSecond)}
	`;
    const leftArrow = selector.querySelector(
      ".rangepicker__selector-control-left"
    );
    const rightArrow = selector.querySelector(
      ".rangepicker__selector-control-right"
    );
    leftArrow.addEventListener("click", () => this.prev());
    rightArrow.addEventListener("click", () => this.next());
    this.renderHighlight();
  }

  prev() {
    this.dateFrom.setMonth(this.dateFrom.getMonth() - 1);
    this.renderDatePicker();
  }

  next() {
    this.dateFrom.setMonth(this.dateFrom.getMonth() + 1);
    this.renderDatePicker();
  }

  renderHighlight() {
    const { from, to } = this.selected;

    for (const cell of this.element.querySelectorAll(".rangepicker__cell")) {
      const { value } = cell.dataset;
      const cellDate = new Date(value);

      cell.classList.remove("rangepicker__selected-from");
      cell.classList.remove("rangepicker__selected-between");
      cell.classList.remove("rangepicker__selected-to");

      if (from && value === from.toISOString()) {
        cell.classList.add("rangepicker__selected-from");
      } else if (to && value === to.toISOString()) {
        cell.classList.add("rangepicker__selected-to");
      } else if (from && to && cellDate >= from && cellDate <= to) {
        cell.classList.add("rangepicker__selected-between");
      }
    }

    if (from) {
      const selectedFromElem = this.element.querySelector(
        `[data-value="${from.toISOString()}"]`
      );
      if (selectedFromElem) {
        selectedFromElem
          .closest(".rangepicker__cell")
          .classList.add("rangepicker__selected-from");
      }
    }

    if (to) {
      const selectedToElem = this.element.querySelector(
        `[data-value="${to.toISOString()}"]`
      );
      if (selectedToElem) {
        selectedToElem
          .closest(".rangepicker__cell")
          .classList.add("rangepicker__selected-to");
      }
    }
  }
  renderCalendar(date) {
    const currentDate = new Date(date);
    const getGridStartIndex = (dayIndex) => {
      const index = dayIndex === 0 ? 6 : dayIndex - 1;
      return index + 1;
    };
    currentDate.setDate(1);
    const month = currentDate.toLocaleString("ru", { month: "long" });

    let cellGrid = `
	  <button type="button"
		class="rangepicker__cell"
		data-value="${currentDate.toISOString()}"
		style="--start-from: ${getGridStartIndex(currentDate.getDay())}">
		  ${currentDate.getDate()}
	  </button>
	`;

    currentDate.setDate(2);
    while (currentDate.getMonth() === date.getMonth()) {
      cellGrid += `
		<button type="button"
		  class="rangepicker__cell"
		  data-value="${currentDate.toISOString()}">
			${currentDate.getDate()}
		</button>`;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let gridContainer = `
	  <div class="rangepicker__calendar">
		<div class="rangepicker__month-indicator">
		  <time datetime="${month}">${month}</time>
		</div>
		<div class="rangepicker__day-of-week">
		  <div>Пн</div>
		  <div>Вт</div>
		  <div>Ср</div>
		  <div>Чт</div>
		  <div>Пт</div>
		  <div>Сб</div>
		  <div>Вс</div>
		</div>
		<div class="rangepicker__date-grid">
		 ${cellGrid}
		</div>
	  </div>
	`;

    return gridContainer;
  }

  onRangePickerCellClick(target) {
    const { value } = target.dataset;

    if (value) {
      const dateValue = new Date(value);

      if (this.selectingFrom) {
        this.selected = {
          from: dateValue,
          to: null,
        };
        this.selectingFrom = false;
        this.renderHighlight();
      } else {
        if (dateValue > this.selected.from) {
          this.selected.to = dateValue;
        } else {
          this.selected.to = this.selected.from;
          this.selected.from = dateValue;
        }

        this.selectingFrom = true;
        this.renderHighlight();
      }

      if (this.selected.from && this.selected.to) {
        this.dispatchEvent();
        this.close();
        this.subElements.from.innerHTML = RangePicker.formatDate(
          this.selected.from
        );
        this.subElements.to.innerHTML = RangePicker.formatDate(
          this.selected.to
        );
      }
    }
  }

  dispatchEvent() {
    this.element.dispatchEvent(
      new CustomEvent("date-select", {
        bubbles: true,
        detail: this.selected,
      })
    );
  }

  remove() {
    this.element.remove();
    document.removeEventListener("click", this.onDocumentClick, true);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.selectingFrom = true;
    this.selected = {
      from: new Date(),
      to: new Date(),
    };

    return this;
  }
}
