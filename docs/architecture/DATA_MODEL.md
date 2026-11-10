# Data Model

## TypeScript 타입

### Category

```ts
type Category = 'top' | 'outer' | 'bottom' | 'dress' | 'shoes' | 'hair' | 'accessory'
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
  catalogItemId: string | null // 재사용하는 정적 아바타 템플릿 id
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
  itemIds: string[]     // 신규 기록은 Item.id(uuid), 기존 기록은 카탈로그 id도 허용
  isFavorite: boolean   // 즐겨찾기(★) — 목록 화면 필터용
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
  sleepingItems: string[]   // 현재 계절 아이템 중 20일 이상 미착용 Item.id
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
  catalog_item_id text,
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
create unique index items_user_catalog_item_unique_idx
  on items (user_id, catalog_item_id)
  where catalog_item_id is not null;
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
  item_ids text[] default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz default now()
);
alter table outfits enable row level security;
create policy "own outfits" on outfits
  using (auth.uid() = user_id);
```

> **마이그레이션 (2026-05-31, 코디 목록/즐겨찾기)**: 기존 outfits 테이블이 이미 있다면
> 아래를 Supabase SQL Editor에서 실행해 `is_favorite` 컬럼을 추가한다. (사용자 작업)
>
> ```sql
> alter table outfits add column if not exists is_favorite boolean not null default false;
> ```

> **마이그레이션 (2026-06-12, 코디 저장 실패 수정 — 이슈 #78)**: `item_ids`가 `uuid[]`로
> 생성된 기존 테이블은 카탈로그 아이템 id(`top_002` 등 문자열)를 저장하지 못해
> 코디 저장이 실패한다. 아래를 Supabase SQL Editor에서 실행한다. (사용자 작업)
>
> ```sql
> alter table outfits alter column item_ids type text[] using item_ids::text[];
> ```

> **마이그레이션 (2026-08-03, 내 옷장 소유 분리 — 이슈 #165)**:
> `supabase/migrations/20260803000100_add_catalog_ownership_to_items.sql`이
> `items.catalog_item_id`와 사용자별 템플릿 중복 방지 인덱스를 추가한다.
> 기존 `items`와 `outfits` row는 수정하거나 삭제하지 않는다.

## 관계

```
auth.users
  └── profiles (1:1)
  └── items (1:N, 사용자가 보유를 확인한 의류)
        └── catalog_item_id → 정적 CatalogItem.id (DB 외부 참조)
  └── outfits (1:N)
        └── item_ids → 신규 items.id(uuid), 기존 카탈로그 id도 조회 호환 (N:M 비정규화)
```

## 계산 규칙

- **소유 경계**: 정적 `CatalogItem`은 둘러보기 템플릿이며 그 자체로 사용자 소유가 아니다.
  사용자가 템플릿을 추가해 생성된 `items` row만 내 옷장·통계·챌린지·잠자는 옷장 분석
  대상이다. 과거 outfit의 정적 id는 같은 `catalog_item_id`를 가진 사용자 item이 있을 때만
  분석 alias로 연결한다. 홈·캘린더·코디 목록/상세는 데이터 손실 방지를 위해 과거 정적 id를
  계속 렌더링한다.
- **잠자는 옷장**: 사용자 소유가 확인된 items에 한해 outfits에서 마지막 착용일을 역산한다. 아이템 `seasons` 메타데이터로 현재 계절(`all` 포함) 코디 아이템 전체를 미착용 긴 순으로 노출. 미착용 10일 미만 = 배지 없음, 10~19일 = 관심 필요, 20일+ = 잠자는 옷. 현재 계절 아님(계절 보관 중)·착용 기록 없음은 제외. 현재 계절 판정은 월 기준(3-5 봄/6-8 여름/9-11 가을/12-2 겨울). 계절은 내부 로직 전용(사용자 선택 UI 없음). `sleepingItems`(월간 리포트)는 20일+ 만 카운트
- **날짜별 대표 코디(임시 안전 정책)**: 아이템이 있는 row 중 `createdAt`이 가장 최신인
  1건을 홈·캘린더·월간/주간 통계·챌린지에서 공통 사용한다. timestamp가 같으면 `id`로
  결정한다. 기존 같은 날짜 row는 목록/상세에서 보존하며 삭제·병합하지 않는다.
- **월간 통계**: 해당 month의 날짜별 대표 코디를 클라이언트에서 집계
- MonthlyReport는 DB에 저장하지 않음 — 매번 계산
