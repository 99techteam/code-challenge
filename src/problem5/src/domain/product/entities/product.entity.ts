import { BaseEntity } from '@/shared/base/base.entity';
import { DomainError } from '@/shared/errors/domain.error';

export class Product extends BaseEntity {
  private _name!: string;
  private _description!: string;
  private _price!: number;
  private _stock!: number;
  private _category!: string;
  private _isActive: boolean;
  private _images!: string[];
  private _tags!: string[];

  constructor(params: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    isActive?: boolean;
    images?: string[];
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(params.id, params.createdAt, params.updatedAt);
    this.updateName(params.name);
    this.updateDescription(params.description);
    this.updatePrice(params.price);
    this.updateStock(params.stock);
    this.changeCategory(params.category);
    this._isActive = params.isActive ?? true;
    this._images = [];
    if (params.images) {
      for (const image of params.images) {
        this.addImage(image);
      }
    }
    this._tags = [];
    if (params.tags) {
      for (const tag of params.tags) {
        this.addTag(tag);
      }
    }
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get stock(): number {
    return this._stock;
  }

  get category(): string {
    return this._category;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get images(): string[] {
    return this._images;
  }

  get tags(): string[] {
    return this._tags;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainError('Product name must not be empty.');
    }
    this._name = name.trim();
    this.touch();
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new DomainError('Product description must not be empty.');
    }
    if (description.trim().length > 1000) {
      throw new DomainError('Description is too long.');
    }
    this._description = description.trim();
    this.touch();
  }

  updatePrice(price: number): void {
    if (!Number.isFinite(price)) {
      throw new DomainError('Price must be a valid number.');
    }
    if (price < 0) throw new DomainError('Price cannot be negative.');
    this._price = price;
    this.touch();
  }

  updateStock(stock: number): void {
    if (!Number.isInteger(stock)) {
      throw new DomainError('Stock must be an integer.');
    }
    if (stock < 0) throw new DomainError('Stock cannot be negative.');
    this._stock = stock;
    this.touch();
  }

  changeCategory(category: string): void {
    if (!category || category.trim().length === 0) {
      throw new DomainError('Category must not be empty.');
    }
    this._category = category.trim();
    this.touch();
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  addImage(url: string): void {
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlPattern.test(url)) {
      throw new DomainError('Invalid image URL.');
    }
    this._images.push(url);
    this.touch();
  }

  removeImage(url: string): void {
    this._images = this._images.filter((image) => image !== url);
    this.touch();
  }

  addTag(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new DomainError('Tag must not be empty.');
    }
    const normalizedTag = tag.trim();
    if (!this._tags.includes(normalizedTag)) {
      this._tags.push(normalizedTag);
      this.touch();
    }
  }

  removeTag(tag: string): void {
    this._tags = this._tags.filter((t) => t !== tag);
    this.touch();
  }

  /**
   * Business rule: Decrease stock quantity
   */
  public decreaseStock(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError('Quantity must be a positive integer.');
    }
    if (quantity > this._stock) {
      throw new DomainError('Insufficient stock.');
    }
    this._stock -= quantity;
    this.touch();
  }

  /**
   * Business rule: Increase stock quantity
   */
  public increaseStock(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError('Quantity must be a positive integer.');
    }
    this._stock += quantity;
    this.touch();
  }
  toJSON(): Record<string, unknown> {
    return {
      _id: this._id,
      _name: this._name,
      _description: this._description,
      _price: this._price,
      _stock: this._stock,
      _category: this._category,
      _isActive: this._isActive,
      _images: this._images,
      _tags: this._tags,
      _createdAt: this._createdAt,
      _updatedAt: this._updatedAt,
    };
  }

  public toPublicObject(): Record<string, unknown> {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      stock: this._stock,
      category: this._category,
      isActive: this._isActive,
      images: this._images,
      tags: this._tags,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static fromJSON(json: Record<string, any>): Product {
    return new Product({
      id: json._id,
      name: json._name,
      description: json._description,
      price: json._price,
      stock: json._stock,
      category: json._category,
      isActive: json._isActive,
      images: json._images,
      tags: json._tags,
      createdAt: new Date(json._createdAt),
      updatedAt: new Date(json._updatedAt),
    });
  }
}
