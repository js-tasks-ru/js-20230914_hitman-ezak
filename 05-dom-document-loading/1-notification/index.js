export default class NotificationMessage {
  static activeNotification;
  constructor(message, { duration = 2000, type = "" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  render() {
    const { template } = this;

    const element = document.createElement("div");
    element.innerHTML = template;

    this.element = element.firstElementChild;
    NotificationMessage.activeNotification = this.element;
  }

  get template() {
    const { message, type, duration } = this;
    const durationInSeconds = duration / 1000 + "s";
    return `
    <div class="notification ${type}" style="--value:${durationInSeconds}">
        <div class="timer"></div>
        <div class="inner-wrapper">
            <div class="notification-header">success</div>
            <div class="notification-body">
                ${message}
            </div>
        </div>
    </div>`;
  }

  show(parent = document.body) {
    const { element, duration } = this;

    parent.append(element);
    this.hide();
  }

  hide = () => {
    setTimeout(() => {
      this.remove();
    }, this.duration);
  };

  remove = () => {
    this.element.remove();
  };

  destroy() {
    clearTimeout(this.hide);
    this.remove;
    this.element = null;
    NotificationMessage.activeNotification = null;
  }
}
