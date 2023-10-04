export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  renderTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig
          .map((item) => this.renderTableHeaderRow(item))
          .join("")}
      </div>
    `;
  }

  renderTableHeaderRow({ id, title, sortable }) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${this.renderSortingArrow()}
      </div>
    `;
  }

  renderSortingArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  renderTableRows(data) {
    return data
      .map((item) => {
        return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.renderTableRow(item)}
        </a>
      `;
      })
      .join("");
  }

  renderTableRow(item) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return { id, template };
    });
    return cells
      .map(({ id, template }) => {
        return template
          ? template(item[id])
          : `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join("");
  }

  renderTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.renderTableRows(this.data)}
      </div>
    `;
  }

  renderTable() {
    return `
      <div class="sortable-table">
        ${this.renderTableHeader()}
        ${this.renderTableBody()}
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

  render() {
    const content = document.createElement("div");
    content.innerHTML = this.renderTable();

    const element = content.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const columns = this.element.querySelectorAll(
      ".sortable-table__cell[data-id]"
    );
    const currentColumn = this.element.querySelector(
      `.sortable-table__cell[data-id="${field}"]`
    );
    columns.forEach((column) => {
      column.dataset.order = "";
    });
    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.renderTableRows(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find((item) => item.id === field);
    const { sortType } = column;
    const direction = order === "asc" ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case "number":
          return direction * (a[field] - b[field]);
        case "string":
          return direction * a[field].localeCompare(b[field], ["ru"]);
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
