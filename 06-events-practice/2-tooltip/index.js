class Tooltip {
  static init;

  constructor() {
    if (Tooltip.init) {
      return Tooltip.init;
    }

    Tooltip.init = this;
  }

  render(html) {
    this.element = document.createElement("div");
    this.element.innerHTML = html;
    this.element.className = "tooltip";
    document.body.append(this.element);
  }

  initMouseEvent() {
    document.addEventListener("pointerover", this.onMouseOver);
    document.addEventListener("pointerout", this.onMouseOut);
  }

  initialize() {
    this.initMouseEvent();
  }

  onMouseOver = (event) => {
    const element = event.target.closest("[data-tooltip]");
    if (element) {
      this.render(element.dataset.tooltip);
      this.moveTooltip(event);
      document.addEventListener("pointermove", this.onMouseMove);
    }
  };

  onMouseOut = () => {
    this.removeTooltip();
  };

  onMouseMove = (event) => {
    this.moveTooltip(event);
  };

  moveTooltip(event) {
    const left = event.clientX + 15;
    const top = event.clientY + 15;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  removeTooltip() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      document.removeEventListener("pointermove", this.onMouseMove);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.initMouseEvent();
    this.removeTooltip();
  }
}

export default Tooltip;
