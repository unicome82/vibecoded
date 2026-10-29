# UNI — Vibe-Coded Portfolio

AI와 함께 코드와 이미지를 만들고, 디자이너의 판단과 반복 수정으로 완성한 바이브 코딩 포트폴리오입니다.

Main → Info → Process → Experiments → Behind → Reflection 순으로 구성됩니다. Parallax, 커서 물결 효과, AI 아트워크 상세 팝업과 제작 기록을 담았습니다.

## 실행

별도 빌드 없이 `index.html`을 열거나 VS Code Live Server로 확인할 수 있습니다.

## 파일 구성

- `index.html`: 섹션과 콘텐츠
- `style.scss`: 스타일 원본
- `style.css`: 브라우저에서 사용하는 CSS
- `scss/_reset.scss`: 기본 스타일 초기화
- `scss/_variable.scss`: 색상·폰트·반응형 기준
- `scss/_mixin.scss`: Flex·위치·타이포 믹스인
- `scss/_layout.scss`: 반응형 스타일
- `script.js`: Parallax, 커서 효과, 작품 팝업
- `assets/`: 사용 중인 작품 이미지와 그래픽

## 수정

스타일은 SCSS에서 수정하고 CSS로 컴파일합니다. VS Code Live Sass Compile을 사용하거나, Sass가 설치돼 있다면 저장소 루트에서 아래 명령을 실행합니다.

```sh
sass --no-source-map style.scss style.css
```

스크롤 거리와 순서는 `script.js`의 `scrollSettings`, 작품 설명과 프롬프트는 `projects` 배열에서 관리합니다. 터치 기기에서는 커서 효과를 사용하지 않으며, 운영체제의 모션 감소 설정에 대응합니다.

폰트는 외부 Google Fonts 및 Pretendard CDN에서 불러옵니다. 작품 이미지는 생성형 AI로 제작했습니다.

이미지는 원본 해상도를 유지한 WebP(품질 88)로 최적화했습니다.

## 시각적 참고

- https://www.thetriadicballetai.com/
- https://sleep-well-creatives.com/

큰 타이포그래피, 여백, 스크롤에 따른 장면 전개를 참고했습니다.
