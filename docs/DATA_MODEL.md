# Data Model

## TypeScript 타입

### Category

```ts
type Category = 'top' | 'bottom' | 'shoes' | 'bag' | 'accessory'
```

### StyleTag

```ts
type StyleTag =
  | 'casual' | 'formal' | 'street' | 'feminine' | 'minimal'
  | 'sporty' | 'vintage' | 'chic' | 'bohemian' | 'preppy'
```

### Mood

```ts
type Mood = 'happy' | 'confident' | 'cozy' | 'tired' | 'excited' | 'calm'
```

### Weather

```ts
type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'hot' | 'cold' | 'windy'
```

### Item

```ts
interface Item {
  id: string            // uuid
  userId: string        // Supabase auth.uid
  name: string
  category: Category
  imagePath: string     // assets/avatar/{category}/{filename}.png
  color: string         // 색상 키 (e.g. 'white', 'denim')
  styleTags: StyleTag[]
  createdAt: string     // ISO 8601
}
```

### Outfit

```ts
interface Outfit {
  id: string
  userId: string
  date: string          // YYYY-MM-DD
  mood: Mood | null
  weather: Weather | null
  memo: string | null
  itemIds: string[]     // Item.id 배열
  createdAt: string
}
```

### MonthlyReport (계산 결과 — DB 저장 안 함)

```ts
interface MonthlyReport {
  year: number
  month: number
  totalOutfits: number
  mostWornColors: Array<{ color: string; count: number }>
  mostWornItems: Array<{ itemId: string; count: number }>
  categoryRatio: Record<Category, number>
  styleRatio: Partial<Record<StyleTag, number>>
  sleepingItems: string[]   // 30일 이상 미착용 Item.id
}
```

### UserProfile

```ts
interface UserProfile {
  id: string            // auth.uid
  username: string | null
  createdAt: string
}
```

## Supabase DB 스키마

### profiles

```sql
create table profiles (
  id uuid references auth.users primary key,
  username text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "own profile" on profiles
  using (auth.uid() = id);
```

### items

```sql
create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  category text not null,
  image_path text not null,
  color text not null,
  style_tags text[] default '{}',
  created_at timestamptz default now()
);
alter table items enable row level security;
create policy "own items" on items
  using (auth.uid() = user_id);
```

### outfits

```sql
create table outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  mood text,
  weather text,
  memo text,
  item_ids uuid[] default '{}',
  created_at timestamptz default now()
);
alter table outfits enable row level security;
create policy "own outfits" on outfits
  using (auth.uid() = user_id);
```

## 관계

```
auth.users
  └── profiles (1:1)
  └── items (1:N)
  └── outfits (1:N)
        └── item_ids → items.id[] (N:M 비정규화)
```

## 계산 규칙

- **잠자는 옷장**: outfits에서 item의 마지막 착용일 역산 → `today - lastWornDate > 30일`
- **월간 통계**: 해당 month의 outfits 전체를 클라이언트에서 집계
- MonthlyReport는 DB에 저장하지 않음 — 매번 계산