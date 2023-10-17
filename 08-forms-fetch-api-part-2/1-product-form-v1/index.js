import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  element;
  subElement = {};
  urlProducts = "/api/rest/products";
  urlCategories = "/api/rest/categories";
  dataProduct = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    images: [],
    price: 100,
    discount: 0,
  };
  categories = [];
  subcategories = [];

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const categoriesPromise = this.loadCategotiesProducts();

    const dataProductPromise = this.productId
      ? this.loadDataProduct(this.productId)
      : [this.dataProduct];

    const [categories, dataProduct] = await Promise.all([
      categoriesPromise,
      dataProductPromise,
    ]);

    this.categories = categories;
    this.dataProduct = dataProduct;

    this.renderForm();

    if (this.dataProduct) {
      this.addDataFormProduct();
      this.addEventFormProduct();
    }

    return this.element;
  }

  async loadDataProduct(productId) {
    const url = new URL(this.urlProducts, BACKEND_URL);
    url.searchParams.set("id", productId);

    const dataProduct = await fetchJson(url);
    this.dataProduct = dataProduct[0];

    return this.dataProduct;
  }

  async loadCategotiesProducts() {
    const url = new URL(this.urlCategories, BACKEND_URL);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");

    this.categories = await fetchJson(url);

    this.categories.forEach((category) => {
      this.subcategories = [
        ...this.subcategories,
        ...category.subcategories.map((subcategory) => ({
          id: subcategory.id,
          categorytitle: category.title,
          subcategorytitle: subcategory.title,
        })),
      ];
    });

    return this.categories;
  }

  renderForm() {
    const element = document.createElement("DIV");

    element.innerHTML = this.dataProduct
      ? this.getProductForm()
      : this.getEmptyTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  getEmptyTemplate() {
    return `<div>
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>`;
  }

  getProductForm() {
    return `
         <div class="product-form">
            <form data-element="productForm" class="form-grid">
            ${this.getProductTitle()}
            ${this.getProductDescription()}
            ${this.getProductImagesContainer()}
            ${this.getProductSubcategory()}
            ${this.getProductPriceDiscount()}
            ${this.getProductQuantity()}
            ${this.getProductStatus()}
            ${this.getProductButton()}
            </form>
         </div>
      `;
  }

  getProductTitle() {
    return `
         <div class="form-group form-group__half_left">
            <fieldset>
               <label class="form-label">Название товара</label>
               <input required id="title" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
         </div>
      `;
  }

  getProductDescription() {
    return `
         <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required id="description" class="form-control" name="description" 
               data-element="productDescription" placeholder="Описание товара"></textarea>
         </div>
      `;
  }

  getProductImagesContainer() {
    return `
         <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">               
            </div>
         </div>
         <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline">
            <span>Загрузить</span>
         </button>
      `;
  }

  getProductSubcategory() {
    return `
         <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" id="subcategory" name="subcategory">
               ${this.getProductSubcategoryOption()}
            </select>
         </div>
      `;
  }

  getProductSubcategoryOption() {
    return this.subcategories
      .map(
        (subcategory) =>
          `<option value="${subcategory.id}">${subcategory.categorytitle} &gt; ${subcategory.subcategorytitle}</option>`
      )
      .join("");
  }

  getProductPriceDiscount() {
    return `
         <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
               <label class="form-label">Цена ($)</label>
               <input required id="price" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
               <label class="form-label">Скидка ($)</label>
               <input required id="discount" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
         </div>
      `;
  }

  getProductQuantity() {
    return `
         <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required id="quantity" type="number" class="form-control" name="quantity" placeholder="1">
         </div>
      `;
  }

  getProductStatus() {
    return `
         <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
               <option value="1">Активен</option>
               <option value="0">Неактивен</option>
            </select>
         </div>
      `;
  }

  getProductButton() {
    const button = this.productId ? "Сохранить товар" : "Добавить товар";
    return `
         <div class="form-buttons">
         <button type="submit" name="save" class="button-primary-outline">
            ${button}
         </button>
         </div>
      `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  addDataFormProduct() {
    const form = this.subElements.productForm;

    form.querySelector('[name="title"]').value = this.dataProduct.title;
    form.querySelector('[name="description"]').value =
      this.dataProduct.description;
    form.querySelector('[name="description"]').value =
      this.dataProduct.description;

    this.subElements.imageListContainer.innerHTML = this.getProductImagesList();

    form.querySelector('[name="subcategory"]').value =
      this.dataProduct.subcategory;
    form.querySelector('[name="price"]').value = this.dataProduct.price;
    form.querySelector('[name="discount"]').value = this.dataProduct.discount;
    form.querySelector('[name="quantity"]').value = this.dataProduct.quantity;
    form.querySelector('[name="status"]').value = this.dataProduct.status;
  }

  getProductImagesList() {
    const image = this.dataProduct.images
      .map((item) => this.getProductImages(item.url, item.source))
      .join(``);
    return `
         <ul class="sortable-list">
            ${image}
         </ul>
      `;
  }

  getProductImages(url, name) {
    return `
         <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${escapeHtml(url)}">
            <input type="hidden" name="source" value="${escapeHtml(name)}">
            <span>
               <img src="icon-grab.svg" data-grab-handle="" alt="grab">
               <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(
                 url
               )}">
               <span>${escapeHtml(name)}</span>
            </span>
            <button type="button">
               <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
         </li>
      `;
  }

  addEventFormProduct() {
    const { imageListContainer, uploadImage, productForm } = this.subElements;

    imageListContainer.addEventListener("click", this.onDeleteImageProduct);

    uploadImage.addEventListener("click", this.onAddImageProduct);

    productForm.addEventListener("submit", this.onSubmitProduct);
  }

  onDeleteImageProduct = (event) => {
    if ("deleteHandle" in event.target.dataset) {
      event.target.closest("li").remove();
    }
  };

  onAddImageProduct = () => {
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append("image", file);

        uploadImage.classList.add("is-loading");
        uploadImage.disabled = true;

        const result = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
        });

        const htmlFile = this.getProductImages(result.data.link, file.name);

        imageListContainer
          .querySelector(".sortable-list")
          .insertAdjacentHTML("beforeend", htmlFile);

        uploadImage.classList.remove("is-loading");
        uploadImage.disabled = false;

        fileInput.remove();
      }
    };

    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  onSubmitProduct = (event) => {
    event.preventDefault();

    this.save();
  };

  async save() {
    const product = this.getFormData();

    const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    this.dispatchEvent(result.id);
  }

  getFormData() {
    const form = this.subElements.productForm;
    const imageListContainer = this.subElements.imageListContainer;

    this.dataProduct.id = this.productId;

    this.dataProduct.title = escapeHtml(
      form.querySelector("[name='title']").value
    );
    this.dataProduct.description = escapeHtml(
      form.querySelector("[name='description']").value
    );
    this.dataProduct.subcategory = form.querySelector(
      "[name='subcategory']"
    ).value;
    this.dataProduct.price = Number(form.querySelector("[name='price']").value);
    this.dataProduct.discount = Number(
      form.querySelector("[name='discount']").value
    );
    this.dataProduct.quantity = Number(
      form.querySelector("[name='quantity']").value
    );
    this.dataProduct.status = Number(
      form.querySelector("[name='status']").value
    );
    this.dataProduct.images = [];

    const imagesHTMLCollection = imageListContainer.querySelectorAll(
      ".sortable-table__cell-img"
    );

    for (const image of imagesHTMLCollection) {
      this.dataProduct.images.push({
        url: image.src,
        source: image.alt,
      });
    }

    return this.dataProduct;
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent("product-updated", { detail: id })
      : new CustomEvent("product-saved");

    this.element.dispatchEvent(event);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElement = {};
}
