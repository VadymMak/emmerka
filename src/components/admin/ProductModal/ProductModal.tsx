'use client';

import { useState, useRef } from 'react';
import type { Vertical } from '@prisma/client';
import styles from './ProductModal.module.css';

export interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice: string;
  inStock: boolean;
  image?: string;
  badge?: string;
  // RESTAURANT fields
  dietaryTags?: string[];
  allergens?: string;
  portion?: string;
  prepTime?: number;
  // FOOD_MARKET fields
  weight?: string;
  expiryDays?: string;
  temperature?: string;
  calories?: string;
  organic?: boolean;
}

export interface ProductModalProps {
  mode: 'add' | 'edit';
  initial: ProductFormData;
  categories: { id: string; slug: string; label: string }[];
  vertical?: Vertical;
  currency?: string;
  onSave: (data: ProductFormData) => void;
  onClose: () => void;
}

const DIETARY_TAGS = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'spicy'] as const;
type DietaryTag = (typeof DIETARY_TAGS)[number];

const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegan: '🌱 Vegan',
  vegetarian: '🥬 Vegetarian',
  'gluten-free': '🌾 Gluten-free',
  'dairy-free': '🥛 Dairy-free',
  'nut-free': '🥜 Nut-free',
  spicy: '🌶️ Spicy',
};

const BADGE_OPTIONS = [
  { value: '', label: 'Bez označenia', emoji: '' },
  { value: 'chef', label: 'Odporúčanie šéfkuchára', emoji: '⭐' },
  { value: 'popular', label: 'Obľúbené', emoji: '🔥' },
  { value: 'new', label: 'Novinka', emoji: '✨' },
] as const;

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function ProductModal({ mode, initial, categories, vertical, currency, onSave, onClose }: ProductModalProps) {
  const [data, setData] = useState<ProductFormData>(initial);
  const [badge, setBadge] = useState(initial.badge ?? '');
  const [dietaryTags, setDietaryTags] = useState<string[]>(initial.dietaryTags ?? []);
  const [allergens, setAllergens] = useState(initial.allergens ?? '');
  const [portion, setPortion] = useState(initial.portion ?? '');
  const [prepTime, setPrepTime] = useState(initial.prepTime ?? 0);
  const [imageUrl, setImageUrl] = useState(initial.image ?? '');
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'product');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        alert(err.error ?? 'Chyba nahrávania');
        return;
      }
      const uploadData = await res.json() as { url: string };
      setImageUrl(uploadData.url);
    } catch {
      alert('Chyba nahrávania');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const toggleDietaryTag = (tag: string) =>
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const isRestaurant = vertical === 'RESTAURANT';
  const isFood = false;
  const currencyLabel = currency === 'EUR' ? '€' : currency;

  const [foodWeight, setFoodWeight] = useState(initial.weight ?? '');
  const [foodExpiryDays, setFoodExpiryDays] = useState(initial.expiryDays ?? '');
  const [foodTemperature, setFoodTemperature] = useState(initial.temperature ?? 'room');
  const [foodCalories, setFoodCalories] = useState(initial.calories ?? '');
  const [foodOrganic, setFoodOrganic] = useState(initial.organic ?? false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({
      ...data,
      image: imageUrl || undefined,
      badge: badge || undefined,
      ...(isRestaurant && { dietaryTags, allergens, portion, prepTime }),
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <h2 className={styles.title}>
            {mode === 'add'
              ? (isRestaurant ? 'Pridať jedlo' : isFood ? 'Pridať produkt' : 'Pridať tovar')
              : (isRestaurant ? 'Upraviť jedlo' : isFood ? 'Upraviť produkt' : 'Upraviť tovar')}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Zatvoriť">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.imageUpload}>
            {imageUrl && (
              <div className={styles.imagePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className={styles.previewImg} />
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className={styles.fileInput}
              onChange={handleImageUpload}
              id="product-image-upload"
            />
            <label htmlFor="product-image-upload" className={styles.uploadLabel}>
              {imageUploading ? 'Nahrávam...' : (imageUrl ? 'Zmeniť foto' : 'Nahrať foto')}
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Názov</span>
            <input
              className={styles.input}
              type="text"
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </label>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span className={styles.label}>Značka</span>
              <input
                className={styles.input}
                type="text"
                value={data.brand}
                onChange={(e) => set('brand', e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Kategória</span>
              <select
                className={styles.input}
                value={data.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Cena, {currencyLabel}</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                step="0.01"
                value={data.price}
                onChange={(e) => set('price', e.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Pôvodná cena, {currencyLabel}</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                step="0.01"
                value={data.oldPrice}
                onChange={(e) => set('oldPrice', e.target.value)}
              />
            </label>
          </div>

          {/* Badge selector */}
          <div className={styles.field}>
            <span className={styles.label}>Označenie (badge)</span>
            <div className={styles.badgeGroup}>
              {BADGE_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.badgeOption}>
                  <input
                    type="radio"
                    name="badge"
                    value={opt.value}
                    checked={badge === opt.value}
                    onChange={() => setBadge(opt.value)}
                  />
                  {opt.emoji ? `${opt.emoji} ${opt.label}` : opt.label}
                </label>
              ))}
            </div>
          </div>

          <label className={styles.toggleRow}>
            <span className={styles.label}>Dostupnosť</span>
            <span className={styles.toggle}>
              <input
                type="checkbox"
                checked={data.inStock}
                onChange={(e) => set('inStock', e.target.checked)}
              />
              <span className={styles.track} />
            </span>
          </label>

          {isFood && (
            <div className={styles.foodFields}>
              <h3 className={styles.fieldGroupTitle}>Charakteristiky produktu</h3>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span className={styles.label}>Hmotnosť / Objem</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={foodWeight}
                    onChange={(e) => setFoodWeight(e.target.value)}
                    placeholder="1 kg"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Doba trvanlivosti (dní)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    value={foodExpiryDays}
                    onChange={(e) => setFoodExpiryDays(e.target.value)}
                    placeholder="14"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Skladovanie</span>
                  <select
                    className={styles.input}
                    value={foodTemperature}
                    onChange={(e) => setFoodTemperature(e.target.value)}
                  >
                    <option value="room">Izbová teplota</option>
                    <option value="refrigerated">Chladnička</option>
                    <option value="frozen">Mrazené</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Kalórie / 100g</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    value={foodCalories}
                    onChange={(e) => setFoodCalories(e.target.value)}
                    placeholder="52"
                  />
                </label>
              </div>
              <label className={styles.organicToggle}>
                <input
                  type="checkbox"
                  checked={foodOrganic}
                  onChange={(e) => setFoodOrganic(e.target.checked)}
                />
                <span>🌿 Organický produkt</span>
              </label>
            </div>
          )}

          {isRestaurant && (
            <div className={styles.restaurantFields}>
              <h3 className={styles.fieldGroupTitle}>Detaily jedla</h3>
              <div>
                <span className={styles.label}>Diétne označenia</span>
                <div className={styles.checkboxGroup}>
                  {DIETARY_TAGS.map((tag) => (
                    <label key={tag} className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={dietaryTags.includes(tag)}
                        onChange={() => toggleDietaryTag(tag)}
                      />
                      {DIETARY_LABELS[tag]}
                    </label>
                  ))}
                </div>
              </div>
              <label className={styles.field}>
                <span className={styles.label}>Alergény (oddelené čiarkou)</span>
                <input
                  className={styles.input}
                  type="text"
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  placeholder="orechy, mlieko, glutén..."
                />
              </label>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span className={styles.label}>Porcia</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    placeholder="350g"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Čas prípravy (min)</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value, 10) || 0)}
                    min={0}
                  />
                </label>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Zrušiť
            </button>
            <button type="submit" className={styles.save}>
              Uložiť
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
