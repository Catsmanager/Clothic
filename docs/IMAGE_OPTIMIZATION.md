# 이미지 최적화 가이드 (온보딩/홈 일러스트)

> 작성: 2026-06-21. 코드/에셋은 변경하지 않은 **권고 문서**입니다.
> 큰 일러스트 PNG가 번들 용량을 키우고 있어 최적화 여지가 있으나, 히어로 디자인 에셋이라
> 화질 손실 없는 방식으로만 진행해야 합니다.

## 대상 (현재 용량)

| 파일 | 용량 | 비고 |
|---|---|---|
| `assets/wardrobe.png` | ~1.3MB | 온보딩 옷장 슬라이드 등에서 사용 |
| `assets/onboarding/onboarding_02_capture.png` | ~1.2MB | 1122×1402 |
| `assets/onboarding/onboarding_01_welcome.png` | ~844KB | |
| `assets/onboarding/onboarding_06_start.png` | ~376KB | |

평면 일러스트라 PNG보다 WebP/최적화 PNG에서 큰 절감이 가능합니다(보통 50~70%).

## 왜 자동으로 적용하지 않았나

현재 작업 환경에 `cwebp`·`pngquant`·`optipng`·ImageMagick이 없고 `sips`만 있습니다.
`sips`만으로는 (a) 안전한 무손실 WebP 변환이 어렵고, (b) JPEG 변환은 투명도(alpha)를 잃고
일러스트에 아티팩트가 생겨 히어로 화면 품질을 떨어뜨립니다. 그래서 보류했습니다.

## 권장 방법 (택1)

### A. 디자이너 WebP 재출력 (가장 안전 — 권장)
원본에서 직접 WebP(품질 90 내외)로 재출력. 화질 기준은 디자이너가 눈으로 확정.

### B. pngquant (PNG 유지, 경로 변경 불필요)
```bash
brew install pngquant
# 고품질(손실 최소) 압축. 결과를 원본 옆에 생성해 육안 비교 후 교체
pngquant --quality=85-95 --strip --skip-if-larger \
  assets/wardrobe.png \
  assets/onboarding/onboarding_01_welcome.png \
  assets/onboarding/onboarding_02_capture.png \
  assets/onboarding/onboarding_06_start.png
# 만족 시 -fr.png 산출물을 원본으로 교체. require 경로 그대로(확장자 동일).
```

### C. cwebp (WebP 변환 — 절감 최대, 코드 경로 변경 필요)
```bash
brew install webp
cwebp -q 90 assets/wardrobe.png -o assets/wardrobe.webp
```
- `require('../assets/wardrobe.png')` → `.webp`로 변경 필요(사용처: `components/onboarding/OnboardingIllustrations.tsx` 등).
- Metro/Expo는 WebP를 번들합니다(iOS/Android/web 모두 렌더 지원). 변경 후 `npx expo export -p web` + 기기 확인 권장.

## 검증 체크리스트(어느 방법이든)
1. 용량 감소 확인 (`du -h`).
2. 온보딩 각 슬라이드 육안 비교(특히 그라데이션/가장자리).
3. `npx tsc --noEmit` / `npx expo lint` PASS.
4. `npx expo export -p web` 성공 + Playwright로 온보딩 렌더 0 에러(기존 검증 방식 재사용).

## 예상 효과
4개 파일 합 ~3.7MB → WebP 기준 대략 1~1.5MB 수준으로 감소 기대(번들/레포 경량화, 초기 로드 개선).
