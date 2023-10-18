import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element;
  subElements = {};
  components = {};
  urlBestsellers = "/api/dashboard/bestsellers";
  urlOrders = "/api/dashboard/orders";
  urlSales = "/api/dashboard/sales";
  urlCustomers = "/api/dashboard/customers";

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
    this.range = {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date(),
    };

    this.loadComponents();
    this.appendComponents();
    this.initEventListeners();
    return this.element;
  }

  get template() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  loadComponents() {
    const rangePicker = new RangePicker({
      from: this.range.from,
      to: this.range.to,
    });
    const sortableTable = new SortableTable(header, {
      url: this.urlBestsellers,
      isSortLocally: true,
    });
    const ordersChart = new ColumnChart({
      label: "orders",
      link: "/sales",
      url: this.urlOrders,
      range: {
        from: this.range.from,
        to: this.range.to,
      },
    });
    const salesChart = new ColumnChart({
      label: "sales",
      url: this.urlSales,
      range: {
        from: this.range.from,
        to: this.range.to,
      },
      formatHeading: (data) => {
        return "$" + new Intl.NumberFormat("ru").format(data);
      },
    });
    const customersChart = new ColumnChart({
      label: "customers",
      url: this.urlCustomers,
      range: {
        from: this.range.from,
        to: this.range.to,
      },
    });
    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable,
    };
  }

  async updateComponents(from = this.range.from, to = this.range.to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
    const url = new URL(this.urlBestsellers, BACKEND_URL);

    url.searchParams.set(
      "from",
      new Date(
        from.getTime() - new Date().getTimezoneOffset() * 60000
      ).toISOString()
    );
    url.searchParams.set(
      "to",
      new Date(
        from.getTime() - new Date().getTimezoneOffset() * 60000
      ).toISOString()
    );
    this.components.sortableTable.addRows(fetchJson(url));
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener(
      "date-select",
      (event) => {
        const { from, to } = event.detail;

        this.updateComponents(from, to);
      }
    );
  }

  appendComponents() {
    Object.entries(this.components).map(([name, component]) => {
      this.subElements[name].append(component.element);
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
