import SortableTableV1 from "../../05-dom-document-loading/2-sortable-table-v1/index.js";
export default class SortableTable extends SortableTableV1 {
  constructor(headerConfig, { data = [] } = {}) {
    super(headerConfig, data);
    this.initClickListener();
  }

  sortArrowClick = (event) => {
    const targetCell = event.target.closest(".sortable-table__cell");

    if (targetCell.dataset.sortable === "true") {
      const fieldId = targetCell.dataset.id;
      const order = targetCell.dataset.order === "desc" ? "asc" : "desc";

      this.sort(fieldId, order);
    }
  };

  initClickListener() {
    this.subElements.header.addEventListener(
      "pointerdown",
      this.sortArrowClick
    );
  }

  destroyClickListener() {
    this.subElements.header.removeEventListener(
      "pointerdown",
      this.sortArrowClick
    );
  }

  destroy() {
    super.destroy();
  }
}
