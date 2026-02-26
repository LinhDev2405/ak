# Rolex Jisseki Select — Refactoring Changelog

## Tổng quan

Refactor component `list-rolex.php` (cũ) → hệ thống mới gồm:
- **Data layer**: `get-jisseki-select.php` (PHP functions)
- **View layer**: `jisseki-select.php` + 3 sub-components
- **JS layer**: `jisseki-select.js` (thay thế `rolex.js`)

Thay đổi cốt lõi: PHP render toàn bộ HTML cho tất cả blocks, JS chỉ show/hide bằng `hidden` attribute.
Loại bỏ hoàn toàn: `eval()`, global `<script>` vars, JS rebuild HTML từ `::` strings.

---

## Files đã tạo mới

| File | Mô tả |
|---|---|
| `resources/views/components/sections/jisseki-select.php` | View chính — render dropdown + tất cả blocks (type 1, 2, 3) |
| `resources/views/components/jisseki/jisseki-item-select.php` | Sub-component: item list (có ảnh) |
| `resources/views/components/jisseki/jisseki-accordion.php` | Sub-component: accordion (không ảnh) |
| `resources/views/components/jisseki/jisseki-item-condition.php` | Sub-component: condition/rank display |
| `functions/features/get-jisseki-select.php` | Data layer: `get_jisseki_select()`, `rolex_prepare_data()`, `rolex_get_type3_data()` |
| `resources/js/modules/jisseki-select.js` | JS module: dropdown toggle + block show/hide (~50 dòng) |

## Files đã chỉnh sửa

| File | Thay đổi |
|---|---|
| `resources/js/entries/common-cat-pc.js` | Thêm import `showmore`, `modal`, `jisseki-select` |
| `resources/js/entries/common-cat-sp.js` | Thêm import `showmore`, `modal`, `jisseki-select` |
| `resources/js/entries/preview-pc.js` | Thêm import `jisseki-select` |
| `resources/js/entries/preview-sp.js` | Thêm import `jisseki-select` |

## Files hiện có được tham chiếu (không sửa)

| File | Vai trò |
|---|---|
| `functions/features/get-rolex-data.php` | `get_rolex_data_by_model()`, `rolex_resolve_model_name()` |
| `functions/features/get-introduce-data.php` | `get_rolex_product_by_path()` |
| `config/rolex_models_list.php` | Danh sách models `[model_en, model_jp]` |
| `config/csv.php` | CSV header mapping (`$rolex_item_header`, 25 keys) |
| `resources/js/modules/showmore.js` | Module showmore (dùng bởi sub-components) |
| `resources/js/modules/modal.js` | Module modal (dùng bởi condition component) |
| `resources/views/components/common/showmore.php` | PHP showmore wrapper |

## Files cũ sẽ bị thay thế (có thể xóa khi migration hoàn tất)

| File cũ | Thay thế bởi |
|---|---|
| `components/rolex/list-rolex.php` | `sections/jisseki-select.php` + `get-jisseki-select.php` |
| `components/items/item-custom-model-select.php` | `jisseki/jisseki-item-select.php` + `jisseki/jisseki-accordion.php` |
| `components/items/item-custom-select.php` | `jisseki/jisseki-item-select.php` |
| `components/items/item-accordion-select.php` | `jisseki/jisseki-accordion.php` |
| `components/items/item-condition-select.php` | `jisseki/jisseki-item-condition.php` |
| `components/items/item-new-rolex-custom.php` | `jisseki/jisseki-item-select.php` |
| `components/items/item-accordion-rolex.php` | `jisseki/jisseki-accordion.php` |
| `js/js_origin/common/brands_lp/rolex.js` | `resources/js/modules/jisseki-select.js` |

---

## Chi tiết tối ưu

### get-jisseki-select.php

- **`rolex_csv_key()`**: Helper function, サンダーバード mapping dùng chung (trước lặp 3 chỗ)
- **CSV cache**: `rolex_get_valid_models()` trả `[$models, $cache]` → `rolex_prepare_data()` nhận cache → mỗi model đọc CSV 1 lần (trước: 2 lần)
- **Xóa `$single` parameter**: Dead code, không bao giờ gọi với `true`
- **Xóa `type2` passthrough**: Chỉ là view concern, không cần đi qua data layer
- **Type 3 thunderbird**: Xóa dead `str_replace` (resolve đã trả đúng giá trị)
- **Type 3 non-model**: Filter theo `model_code` thay vì lấy toàn bộ model (khớp behavior cũ)
- **Bug fix**: `$results[0]['path']` → `$results[0]['category_url']` (key `path` không tồn tại trong CSV header)

### jisseki-select.php (view)

- **Xóa fake/test data**: 10 dòng hardcoded model, brands, path
- **Fix default types**: `?? []` → `?? false` / `?? ''` cho boolean/string params
- **Merge type 1 & 2**: Từ 2 block gần giống → 1 block, khác biệt qua `if ($component_type === 2)`
- **Deduplicate note**: 2 `<p>` note giống hệt → 1 với condition chung
- **`data-block-id` + `hidden`**: Mỗi block có ID, blocks id>0 mặc định hidden

### jisseki-select.js

- **431 dòng → ~50 dòng**: Loại bỏ toàn bộ HTML rebuild logic
- **0 `eval()`**: Không dùng global vars, không eval
- **0 `<script>` tags**: Không cần PHP output `<script>` cho JS data
- **Show/hide pattern**: `this.hidden = +this.dataset.blockId !== id`
- **Showmore/modal**: Delegate cho modules có sẵn thay vì tự viết

---

## Data flow comparison

### Old (rolex.js — 431 lines)

```
PHP → <script>var json_new_item_arr_1 = ["::" strings]</script>
                                    ↓
JS click → eval("json_new_item_arr_" + tab_id)
                                    ↓
get_data_product() → parse "::" → build HTML string
                                    ↓
$('#item_new_rolex').html(rebuilt_html)
```

### New (jisseki-select.js — 50 lines)

```
PHP → <div data-block-id="0">...rendered HTML...</div>
      <div data-block-id="1" hidden>...rendered HTML...</div>
      <div data-block-id="2" hidden>...rendered HTML...</div>
                                    ↓
JS click → blocks.each(b => b.hidden = b.dataset.blockId != id)
```

---

## Verification: Old vs New — Detailed Comparison

### Files compared

| Old file | New equivalent |
|---|---|
| `components/rolex/list-rolex.php` (421 lines) | `resources/views/components/sections/jisseki-select.php` (146 lines) + `functions/features/get-jisseki-select.php` (260 lines) |
| `js/js_origin/common/brands_lp/rolex.js` (431 lines) | `resources/js/modules/jisseki-select.js` (55 lines) |
| `components/items/item-custom-model-select.php` (146 lines) | `resources/views/components/jisseki/jisseki-item-select.php` + `jisseki-accordion.php` |
| `components/items/item-custom-select.php` (82 lines) | `resources/views/components/jisseki/jisseki-item-select.php` |
| `components/items/item-accordion-select.php` (60 lines) | `resources/views/components/jisseki/jisseki-accordion.php` |
| `components/items/item-condition-select.php` (90 lines) | `resources/views/components/jisseki/jisseki-item-condition.php` |
| `components/items/item-new-rolex-custom.php` (Type 3) | `resources/views/components/jisseki/jisseki-item-select.php` |
| `components/items/item-accordion-rolex.php` (Type 3) | `resources/views/components/jisseki/jisseki-accordion.php` |

### 🔴 Bugs found & fixed

#### 1. Accordion brand/product display (jisseki-accordion.php)

**Problem**: New code used `brand_name_jp` (CSV index 2, = "ロレックス") as the brand label and `full_title_jp` (index 3) as-is for the product name.

Old code used `model_name_jp` (CSV index 1, e.g. "サブマリーナ") as the brand label, and stripped it from `full_title_jp` to get just the variant (e.g. " デイト 116610LN").

**Visual difference**:
- Old: `[サブマリーナ]` `[デイト 116610LN]`
- New (before fix): `[ロレックス]` `[ロレックス サブマリーナ デイト 116610LN]`

**Fix**: Changed `$brand_name` from `brand_name_jp` → `model_name_jp`, added `str_replace` to strip model name from full title. Now matches old behavior exactly.

#### 2. Items with no prices rendered (jisseki-item-select.php)

**Problem**: Old code (`item-custom-select.php`, `item-custom-model-select.php`, `item-new-rolex-custom.php`, `rolex.js`) all skip items where `price_rank_a_purchase` AND `price_rank_b_purchase` are both empty/0. New code rendered them without prices.

**Fix**: Added early `continue` when both prices ≤ 0 in both showmore and non-showmore branches.

### 🟡 Intentional behavior changes (improvement)

#### 1. Link resolution — `model_detail_url` thay vì `get_permalink_by_slug`

- Old `item-custom-select.php` & `item-condition-select.php`: Gọi `append_permalink_to_all_items()` → N lần `get_permalink_by_slug($items[11], 'page')` (WP DB query mỗi item)
- Old `item-custom-model-select.php`: Gọi `get_permalink_by_slug` trực tiếp
- Old accordion components: Đã dùng `$items[23]` (CSV `model_detail_url`) — không qua DB

**New code**: Thống nhất dùng `model_detail_url` (CSV index 23) cho tất cả components.

**Rationale**: Loại bỏ N+1 DB queries. Nếu CSV được generate từ cùng source, URLs giống nhau. Old accordion code đã dùng index 23, nên đây là unify approach.

#### 2. Type 2 item count limit loại bỏ

- Old `item-custom-select.php`: `$total = ($id === 0 || $count < 10) ? $count : 10` — non-default blocks chỉ render 10 items HTML, JS rebuild từ full array.
- New: Render tất cả items trong PHP, showmore component ẩn items > threshold.

**Rationale**: Không cần limit vì JS không rebuild nữa. Showmore xử lý UX. Kết quả giống: user thấy 8 items ban đầu, nhấn "もっと見る" để xem thêm.

#### 3. `checkSolutionCTA()` / `is_solution` / `is_h3` không port

- Old `rolex.js`: `arr_page_h3 = []` → `is_h3` **luôn false**
- Old PHP: `checkSolutionCTA()` cho `is_solution`, dùng để chọn `<h3>` vs `<div>` cho item name
- Vì `is_h3` luôn false → luôn render `<div>`, `is_solution` redundant

**New code**: Dùng `<a>` (có link) hoặc `<p>` (không link). Semantically better. Kết quả render giống.

#### 4. `append_permalink_to_all_items` loại bỏ trong condition

- Old `item-condition-select.php`: Gọi `append_permalink_to_all_items` nhưng **không dùng link** (condition chỉ hiển thị name + price + image)
- New: Không gọi. Bớt DB overhead thừa.

### ✅ Verified: behavior matches

| Feature | Old | New | Match? |
|---|---|---|---|
| Dropdown `data-value` mapping | 1-indexed (`$indexSelect++` before use) | 1-indexed (`$index + 1`) | ✅ |
| Default block visible | `active` class / no `item-hide` | `data-block-id="0"` visible | ✅ |
| Per-model blocks hidden | `#tab_pane_N` hide/show (Type 1) or JS rebuild (Type 2) | `data-block-id="N" hidden` | ✅ |
| Showmore threshold: items | `>= 8` → `item-hide` | `>= 8` → `js-showmore-item` | ✅ |
| Showmore threshold: accordion | `>= 12` → `item-hide` | `>= 12` → `js-showmore-item` | ✅ |
| Showmore threshold: condition | `>= 6` → `item-hide` | `>= 6` → `js-showmore-item` | ✅ |
| Condition: 2 boxes per item (A + AB) | 2 `div.condition-item` per loop | 2 `li` via `$rank_fields` loop | ✅ |
| Condition no-image fallback | `rolex/no_image.jpg` | `rolex/no_image.jpg` | ✅ |
| Accordion header text | "買取価格" (Type 3) / "買取実績" (Type 1 inline) | "買取価格" | ✅ (standardized) |
| Type 2 default: no accordion | Empty `#accordion-rolex` div | `$default_accordion` empty → component skips | ✅ |
| Type 3 サンダーバード | Reverse map デイトジャスト→サンダーバード for title | `rolex_resolve_model_name` returns サンダーバード from config | ✅ |
| Type 3 Explorer Ⅰ strip | `str_replace('Ⅰ','')` except explorer pages | Same logic | ✅ |
| Type 3 non-model title | `{brand} {model} Ref.{number}の 買取価格相場表` | Same | ✅ |
| Note text (main) | `※買取価格はあくまで参考です...※相場の変動や在庫の状況によって...` | Same | ✅ |
| Note text (condition) | `...付属品やお品物の状態によって...` (longer) | Same | ✅ |
| Modal trigger | `[data-modal]` → fadeIn | `js-modal-open` class | ✅ (module) |
| Outside click close dropdown | `$(document).on('click')` check | Same pattern | ✅ |

### Accordion header text note

Old code had inconsistency:
- `item-custom-model-select.php` (Type 1 inline): header right = "買取実績"
- `item-accordion-rolex.php` (Type 3): header right = "買取価格"
- `rolex.js` (JS rebuild): header right = "買取実績"

New code standardizes on "買取価格" which is arguably more accurate ("buy-back price" vs "buy-back record"). Minor text difference.

---

## Line count comparison

| Component | Old lines | New lines | Reduction |
|---|---|---|---|
| Main PHP (data+view) | 421 | 260+146 = 406 | -4% (split into data/view) |
| JS | 431 | 55 | **-87%** |
| item-select (Type 1+2+3) | 146+82+100 = 328 | 143 | **-56%** |
| accordion (Type 1+2+3) | 146*+60+89 = 295 | 83 | **-72%** |
| condition | 90 | 90 | 0% |
| **Total** | **1565** | **777** | **-50%** |

\* Type 1 accordion was inline in item-custom-model-select.php (shared 146 lines)
