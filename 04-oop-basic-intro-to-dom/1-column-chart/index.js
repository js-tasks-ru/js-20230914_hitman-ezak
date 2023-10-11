export default class ColumnChart {
  subElements = {};
  chartHeight = 50;
  constructor({
    data = [],
    label = "",
    value = "",
    link = "",
    formatHeading = false,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }
  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
    this.subElements = this.getSubElements(this.element);
  }

  get template() {
    return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${
          this.chartHeight
        }">
        <div class="column-chart__title">
            Total ${this.label}
            ${this.getLink()}
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${this.getFormatHeading(
              this.value
            )}</div>
            <div data-element="body" class="column-chart__chart">
            ${this.getColumnChartBody(this.data)}
        </div>
        </div>
    `;
  }

  getFormatHeading(data) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    });
    return this.formatHeading ? formatter.format(data) : data;
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  getColumnChartBody(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    return data
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0);
        return `<div style="--value: ${Math.floor(
          item * scale
        )}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  getSubElements(element) {
    const dataElements = element.querySelectorAll("[data-element]");
    return [...dataElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  update(data) {
    this.subElements.body.innerHTML = this.getColumnChartBody(data);
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
