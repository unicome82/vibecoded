const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');


const scrollSettings = {
  intro: { distance: 14000, hold: 1200, orbit: [0, .2], orbitExit: [.2, .28], exits: [[.28, .36], [.36, .44]], meta: [.44, .52, .6], planet: [.68, .8], title: [.72, .78], titleStagger: .04, stagger: .08 },
  info: { distance: 4200, chapter: 2100 },
  process: { start: .4, holdSteps: 1 },
  work: { delay: 1000 },
  interlude: { pause: 1000 }
};
const header = document.querySelector('header');
let bodyScrollLock = null;
function lockBodyScroll() {
  if (bodyScrollLock) return;
  const body = document.body;
  const properties = ['position', 'top', 'left', 'right', 'width', 'overflow'];
  bodyScrollLock = {
    x: window.scrollX,
    y: window.scrollY,
    styles: Object.fromEntries(properties.map(property => [property, body.style[property]])),
    rootOverflow: document.documentElement.style.overflow
  };
  Object.assign(body.style, { position: 'fixed', top: `${-bodyScrollLock.y}px`, left: '0', right: '0', width: '100%', overflow: 'hidden' });
  document.documentElement.style.overflow = 'hidden';
}
function unlockBodyScroll() {
  if (!bodyScrollLock) return;
  const saved = bodyScrollLock;
  Object.assign(document.body.style, saved.styles);
  document.documentElement.style.overflow = saved.rootOverflow;
  bodyScrollLock = null;
  window.scrollTo({ top: saved.y, left: saved.x, behavior: 'instant' });
}
let mobileHeader = false;
let headerScrollY = window.scrollY;
let headerMotionUntil = 0;
const reflectionSection = document.querySelector('#reflection');
const navLinks = [...document.querySelectorAll('header nav a')];
const progress = document.querySelector('.progress');
const topLink = document.querySelector('.top-link');
document.querySelectorAll('.logo, .top-link').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
}));
const intro = document.querySelector('.intro');
const introPin = intro.querySelector('.pin');
const introOrbit = intro.querySelector('.halo');
const titleLines = [...intro.querySelectorAll('.hero-line .text')];
const introMeta = [...intro.querySelectorAll('.hero-meta > span, .hero-description')];
const accents = ['type-dot', 'type-circle', 'type-star'].map(type => intro.querySelector(`.accent.${type}`));
const interlude = document.querySelector('.interlude');
const track = interlude.querySelector('.track');
const infoSection = document.querySelector('#info');
document.querySelector('.scroll-link').addEventListener('click', event => {
  event.preventDefault();
  const target = window.scrollY + infoSection.getBoundingClientRect().top - header.offsetHeight - 12;
  window.scrollTo({ top: target, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
});
const infoSpread = infoSection.querySelector('.spread');
const infoArt = [...infoSection.querySelectorAll('.art:not(.type-mobile)')];
const infoChapters = [...infoSection.querySelectorAll('.chapter')].map(element => ({ element, titles: [...element.querySelectorAll('.title strong, .title em')], details: [...element.querySelectorAll('.eyebrow, p, .small-note')] }));
const processSection = document.querySelector('#skill');
const processStage = processSection.querySelector('.stage');
const processTimeline = processSection.querySelector('.timeline');
let processPinned = false;
function renderProcess() {
  if (!processPinned) {
    processTimeline.style.transform = '';
    return;
  }
  const top = parseFloat(processSection.style.getPropertyValue('--process-top')) || 104;
  const distance = processSection.offsetHeight - processStage.offsetHeight;
  const time = Math.max(0, Math.min(1, (top - processSection.getBoundingClientRect().top) / distance));
  const progress = Math.max(0, Math.min(1, (time - scrollSettings.process.start) / (1 - scrollSettings.process.start)));
  const position = progress * Math.max(0, processTimeline.children.length - 1 - scrollSettings.process.holdSteps);
  const step = Math.floor(position);
  const items = processTimeline.children;
  const origin = items[0].offsetTop;
  const from = items[step].offsetTop - origin;
  const to = items[Math.min(step + 1, items.length - 1)].offsetTop - origin;
  const travel = from + (to - from) * smooth(.15, .85, position - step);
  processTimeline.style.transform = `translateY(${-travel}px)`;
}
const behindSection = document.querySelector('#behind');
const interludeFrame = interlude.querySelector('.frame');
const fills = [...document.querySelectorAll('.backdrop .fill')];
const smooth = (from, to, value) => { const t = Math.max(0, Math.min(1, (value - from) / (to - from))); return t * t * (3 - 2 * t); };
function renderSections() {
  const active = !reduceMotion.matches;
  const vh = window.innerHeight;
  const frame = interludeFrame;
  const top = parseFloat(interlude.style.getPropertyValue('--scene-top')) || 103;
  const distance = Math.max(1, interlude.offsetHeight - frame.offsetHeight);
  const elapsed = top - interlude.getBoundingClientRect().top;
  const stages = [
    smooth(vh, vh * .15, infoSection.getBoundingClientRect().top),
    smooth(vh, vh * .15, processSection.getBoundingClientRect().top),
    smooth(vh, vh * .15, workSection.getBoundingClientRect().top),
    smooth(vh, vh * .15, behindSection.getBoundingClientRect().top),
    smooth(vh * .6, top, behindSection.getBoundingClientRect().bottom),
    smooth(vh, vh * .15, reflectionSection.getBoundingClientRect().top)
  ];
  const ratio = 2.4;
  const radius = Math.hypot(window.innerWidth / (2 * ratio), vh * 1.1) + 4;
  fills.forEach((fill, index) => {
    const value = active ? stages[index] : Number(stages[index] >= .5);
    fill.style.clipPath = `ellipse(${value * radius * ratio}px ${value * radius}px at 50% 110%)`;
  });
  document.body.dataset.theme = stages[5] > .5 ? 'light' : stages[4] > .5 ? 'blue' : stages[3] > .5 ? 'light' : stages[2] > .5 ? 'black' : stages[1] > .5 ? 'light' : stages[0] > .5 ? 'yellow' : 'light';
  const start = frame.clientWidth * .5;
  track.style.transform = active ? `translateX(${start - smooth(scrollSettings.interlude.pause, distance - scrollSettings.interlude.pause, elapsed) * track.scrollWidth}px)` : '';
  track.style.opacity = active ? (stages[4] >= 1 ? smooth(0, scrollSettings.interlude.pause, elapsed) * (1 - smooth(distance - scrollSettings.interlude.pause, distance, elapsed)) : 0) : 1;
}
function renderInfo() {
  const active = !reduceMotion.matches;
  const bounds = infoSection.getBoundingClientRect();
  const top = parseFloat(infoSection.style.getPropertyValue('--info-top')) || 103;
  const pinned = !infoSection.classList.contains('is-static');
  const elapsed = active && pinned ? Math.max(0, top - bounds.top) : 0;
  const time = Math.min(1, elapsed / scrollSettings.info.distance);
  infoChapters.forEach(({ element: chapter, titles, details }, index) => {
    const local = elapsed - index * scrollSettings.info.chapter;
    const exit = active && pinned ? smooth(1540, 1940, local) : 0;
    chapter.style.opacity = 1 - exit;
    chapter.style.visibility = active && pinned && (local < 0 || exit === 1) ? 'hidden' : '';
    chapter.style.translate = active && pinned ? `0 ${-exit * infoSpread.clientHeight * .45}px` : '';
    titles.forEach((line, row) => {
      const enter = active && pinned ? smooth(row * 180, 360 + row * 180, local) : 1;
      line.style.opacity = enter;
      line.style.transform = `translateX(${(1 - enter) * (index ? 55 : -55)}px)`;
    });
    details.forEach(el => {
      el.style.opacity = active && pinned ? smooth(260, 540, local) : 1;
    });
  });
  infoArt.forEach(art => {
    const change = active && pinned ? smooth(.37, .63, time) : 0;
    art.querySelector('.next').style.clipPath = `inset(${(1 - change) * 100}% 0 0 0)`;
  });
}
function renderIntro() {
  const active = !reduceMotion.matches;
  const top = parseFloat(intro.style.getPropertyValue('--intro-top')) || 91;
  const distance = intro.offsetHeight - introPin.offsetHeight;
  // Reserve the final 1200px of natural scrolling for the assembled title.
  const animationDistance = Math.max(1, distance - scrollSettings.intro.hold);
  const time = active ? Math.max(0, Math.min(1, (top - intro.getBoundingClientRect().top) / animationDistance)) : 0;
  const width = introPin.clientWidth, height = introPin.clientHeight;
  intro.style.setProperty('--orbit-position', `${87.36 - Math.min(1, time / scrollSettings.intro.orbit[1]) * 100}%`);
  introOrbit.style.transform = `translateY(${-smooth(...scrollSettings.intro.orbitExit, time) * (height + introOrbit.offsetWidth)}px)`;
  const pin = introPin.getBoundingClientRect();
  const gap = Math.max(8, height * .015);
  const groupHeight = titleLines.reduce((sum, line) => sum + line.offsetHeight * .5, 0) + gap * (titleLines.length - 1);
  let cursor = height / 2 - groupHeight / 2;
  titleLines.forEach((line, index) => {
    const settle = smooth(scrollSettings.intro.title[0] + index * scrollSettings.intro.titleStagger, scrollSettings.intro.title[1] + index * scrollSettings.intro.titleStagger, time);
    const box = line.parentElement.getBoundingClientRect();
    const targetY = cursor + line.offsetHeight * .25;
    const x = pin.left + width / 2 - box.left - line.offsetLeft - line.offsetWidth / 2;
    const y = pin.top + targetY - box.top - line.offsetTop - line.offsetHeight / 2;
    line.style.transform = `translate(${x * settle}px,${y * settle}px) scale(${1 - settle * .5})`;
    line.style.opacity = 1;
    cursor += line.offsetHeight * .5 + gap;
  });
  accents.forEach((el, index) => {
    if (index === 0) {
      const settle = smooth(...scrollSettings.intro.planet, time);
      const parent = el.offsetParent.getBoundingClientRect();
      const x = pin.left + width / 2 - parent.left - el.offsetLeft - el.offsetWidth / 2;
      const y = pin.top + height / 2 - groupHeight / 2 - gap - el.offsetHeight * 1.5 - 24 - parent.top - el.offsetTop;
      el.style.transform = `translate(${x * settle}px,${y * settle}px)`;
      el.style.opacity = 1;
      return;
    }
    const [start, end] = scrollSettings.intro.exits[index - 1];
    const duration = smooth(start, end, time);
    const leave = Math.pow(duration, [1, 1.5, .9][index]);
    const distance = el.offsetTop + el.offsetHeight * 1.1 + 40;
    el.style.transform = `translateY(${-leave * distance}px)`;
    el.style.opacity = 1;
  });
  introMeta.forEach((el, index) => {
    const start = scrollSettings.intro.meta[Math.min(index, scrollSettings.intro.meta.length - 1)];
    el.style.transform = `translateY(${-smooth(start, start + scrollSettings.intro.stagger, time) * (height + el.offsetHeight)}px)`;
  });
}
const workSection = document.querySelector('#work');
const workTrack = workSection.querySelector('.projects');
const workPin = document.createElement('div');
workPin.className = 'work-pin';
workPin.append(...workSection.children);
workSection.append(workPin);
const workViewport = document.createElement('div');
workViewport.className = 'work-viewport';
workViewport.setAttribute('role', 'group');
workViewport.setAttribute('aria-label', '스크롤로 좌우 이동하는 프로젝트 목록');
workTrack.before(workViewport);
workViewport.append(workTrack);
const workDelay = scrollSettings.work.delay;
let workDistance = 0;
let workTop = 0;
function measureWork() {
  mobileHeader = getComputedStyle(header).flexDirection === 'column';
  if (!mobileHeader) header.classList.remove('logo-hidden');
  const rootStyle = getComputedStyle(document.documentElement);
  const compactMax = parseFloat(rootStyle.getPropertyValue('--compact-max'));
  const pinMinHeight = parseFloat(rootStyle.getPropertyValue('--pin-min-height'));
  processPinned = getComputedStyle(processSection).getPropertyValue('--process-pinned').trim() === '1';
  const enabled = !reduceMotion.matches && window.innerHeight > 620;
  workSection.classList.toggle('work-horizontal', enabled);
  workTop = header.offsetHeight + 12;
  document.documentElement.style.setProperty('--header-offset', `${workTop}px`);
  processSection.style.setProperty('--process-top', `${workTop}px`);
  infoSection.style.setProperty('--info-top', `${workTop}px`);
  infoSection.classList.toggle('is-static', reduceMotion.matches || window.innerWidth <= compactMax || window.innerHeight < pinMinHeight);
  infoSection.style.height = infoSection.classList.contains('is-static') ? '' : `${infoSpread.offsetHeight + scrollSettings.info.distance}px`;
  intro.style.setProperty('--intro-top', `${workTop - 12}px`);
  intro.classList.toggle('is-static', reduceMotion.matches);
  intro.style.height = reduceMotion.matches ? '' : `${introPin.offsetHeight + scrollSettings.intro.distance}px`;
  interlude.style.setProperty('--scene-top', `${workTop}px`);
  interlude.classList.toggle('is-static', reduceMotion.matches);
  const textFrame = interludeFrame;
  interlude.style.height = reduceMotion.matches ? '' : `${textFrame.offsetHeight + scrollSettings.interlude.pause * 2 + Math.max(600, track.scrollWidth)}px`;
  workPin.style.setProperty('--work-top', `${workTop}px`);
  workDistance = enabled ? Math.max(0, workTrack.scrollWidth - workViewport.clientWidth) : 0;
  workSection.style.height = enabled ? `${workPin.offsetHeight + workDelay * 2 + workDistance}px` : '';
  if (!enabled) { workTrack.style.removeProperty('transform'); workPin.style.removeProperty('--work-progress'); }
}
measureWork();
let scheduled = false;
function renderScroll() {
  if (bodyScrollLock) { scheduled = false; return; }
  const y = window.scrollY, vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  header.classList.toggle('scrolled', y > 20);
  if (mobileHeader) {
    if (performance.now() < headerMotionUntil) headerScrollY = y;
    else if (Math.abs(y - headerScrollY) > 8 || y <= 20) {
      const hidden = y > 20 && y > headerScrollY;
      if (hidden !== header.classList.contains('logo-hidden')) {
        header.classList.toggle('logo-hidden', hidden);
        headerMotionUntil = performance.now() + 300;
      }
      headerScrollY = y;
    }
  }
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  topLink.hidden = infoSection.getBoundingClientRect().top > header.offsetHeight;
  renderIntro();
  renderSections();
  renderInfo();
  renderProcess();
  if (workSection.classList.contains('work-horizontal')) {
    const travel = Math.max(0, Math.min(workDistance, workTop - workSection.getBoundingClientRect().top - workDelay));
    workTrack.style.transform = `translate3d(${-travel}px,0,0)`;
    workPin.style.setProperty('--work-progress', workDistance ? travel / workDistance : 0);
  }
  scheduled = false;
}
function scheduleScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(renderScroll); } }
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', () => { measureWork(); scheduleScroll(); });
new ResizeObserver(() => { measureWork(); scheduleScroll(); }).observe(header);
document.fonts.ready.then(() => { measureWork(); scheduleScroll(); });
renderScroll();
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) navLinks.forEach(link => {
    const active = link.hash === `#${entry.target.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
}), { rootMargin: '-15% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
const posterPrompt = "Create a square mid-century modern graphic poster with a coherent 1950s-1960s print-design sensibility. Use oversized artwork, deliberate cropping, precise geometry and balanced negative space. Add subtle paper grain and restrained ink texture. Return flat finished artwork, not a mockup. Avoid gradients, glossy 3D, photorealism, random decoration and heavy artificial distress.";
const projects = [
  {"title":"FORMA®","category":"AI Artwork Collection","image":"assets/work-midcentury/forma.webp","description":"미드센츄리 포스터의 비례와 리듬을 탐구한 AI 아트워크입니다.\n옐로우 배경, 대형 타원 루프, 과감한 타이포가 하나의 구성으로 읽히도록 방향을 정하고 프롬프트를 구체화했습니다.","prompt":"FORMA: Golden-yellow background (#E8C547), near-black ink. Three monumental intersecting elliptical loops with consistent stroke thickness, cropped at selected edges. Oversized tightly kerned grotesk FORMA lettering, one deliberate overlap with the loops. Tiny INDEPENDENT FORMS and UNI / 2026 captions."},
  {"title":"STILL","category":"AI Artwork Collection","image":"assets/work-midcentury/still.webp","description":"고요함을 큰 형태와 여백으로 표현한 AI 아트워크입니다.\n아이보리 바탕의 아치와 오렌지 원, 세리프 이탤릭의 관계를 조율해 차분하면서도 대담한 포스터로 만들었습니다.","prompt":"STILL: Warm ivory background (#F2EBDD), a monumental near-black arch and one flat orange disc. Strong asymmetric balance, quiet ivory negative space. Integrate large literary serif italic Still. lettering into the composition. Small THE ART OF SLOW LIVING caption and UNI / 2026 credit."},
  {"title":"OFFGRID","category":"AI Artwork Collection","image":"assets/work-midcentury/offgrid.webp","description":"그리드의 구조를 대담한 선과 여백으로 형상화한 미드센츄리 AI 아트워크입니다.\n아이보리 바탕 위로 교차하는 블랙과 코발트 블루가 질서 있는 리듬을 만들고, 절제된 구성 안에서 비례와 색의 대비를 드러냅니다.","prompt":"OFFGRID: Warm ivory background. An abstract grid reduced to exactly two thick parallel near-black horizontal bars and two thick parallel cobalt-blue vertical bars intersecting at right angles, enclosing one open ivory square. Consistent stroke thickness, precise spacing and intentional edge cropping. Flat near-black intersections, no shading or dimensional weaving. Small OFFGRID caption and UNI / 2026 credit. No extra bars, repeated lattice, decorative shapes or giant typography."},
  {"title":"OBJECTS","category":"AI Artwork Collection","image":"assets/work-midcentury/objects.webp","description":"일상의 사물을 대담한 실루엣과 색면으로 재구성한 미드센츄리 AI 아트워크입니다.\n따뜻한 오렌지 바탕에 코발트 블루 화병과 블랙 볼, 아이보리 원을 겹쳐 곡선의 리듬과 색의 균형을 표현했습니다.","prompt":"OBJECTS: Soft warm orange background matched to TERRA. A monumental cobalt-blue vase, a near-black shallow pedestal bowl overlapping the foreground, an ivory disk at lower right and a cropped near-black vessel along the right edge. Bold flat silhouettes, intentional overlaps and edge cropping. Small condensed OBJECTS title with UNI / 2026 at upper left. Mid-century print design with fine paper grain and restrained ink texture. No gradients or realistic rendering."},
  {"title":"MONO","category":"AI Artwork Collection","description":"글자 자체를 오브젝트로 사용한 AI 아트워크입니다.\n대형 M과 O의 획, 속공간, 화면 밖으로 잘리는 비례를 중심으로 강한 타이포그래피 구성을 탐구했습니다.","image":"assets/work-midcentury/mono.webp","prompt":"MONO: Warm ivory background, near-black ink and one small vermilion accent. A monumental heavy M and a circular O counterform fill the square. Use positive and negative space as the main graphic rhythm. Integrate readable condensed MONO lettering with carefully judged optical spacing and deliberate cropping."},
  {"title":"BLOOM","category":"AI Artwork Collection","description":"반복되는 꽃잎의 리듬과 개화를 표현한 AI 아트워크입니다.\n레드와 아이보리의 대비, 화면을 채우는 꽃, 과감한 세리프 타이포를 하나의 인상으로 연결했습니다.","image":"assets/work-midcentury/bloom.webp","prompt":"BLOOM: Vermilion-red background (#D94732), warm ivory petals and a near-black center. One monumental six-petal abstract flower with coherent rotational geometry, cropped along two sides. Integrate oversized expressive serif BLOOM lettering into the negative space. No realistic flowers or decorative clutter."},
  {"title":"WAVE FORM","category":"AI Artwork Collection","description":"소리의 흐름을 하나의 넓은 리본으로 재해석한 AI 아트워크입니다.\n블루 배경 위 아이보리와 옐로우 면이 접히며 방향을 바꾸고, 작은 캡션은 리본의 움직임에 시선이 머물도록 배치했습니다.","image":"assets/work-midcentury/wave.webp","prompt":"WAVE FORM: Cobalt-blue background (#2850C8). One monumental wide folded ribbon crosses the square diagonally and changes direction twice. Ivory front and golden-yellow reverse, expressed through flat inks only. Smooth curves, coherent folds, deliberate edge cropping and generous blue negative space. Small WAVE FORM caption. No parallel wave lines."},
  {"title":"TERRA","category":"AI Artwork Collection","description":"도자기의 곡선과 물성을 평면 그래픽으로 재해석한 AI 아트워크입니다.\n오렌지 바탕의 큰 아이보리 실루엣과 세리프 타이포로 따뜻함과 조형성을 함께 표현했습니다.","image":"assets/work-midcentury/terra.webp","prompt":"TERRA: Warm orange background (#E66B32), warm ivory and near-black ink. One monumental vase silhouette with two confident asymmetric curves and a clean elliptical opening, cropped at the bottom. Large refined serif TERRA lettering integrated near the shoulder. Flat sculptural print design, no rendered pottery or realistic shadows."},
  {"title":"FRAME","category":"AI Artwork Collection","description":"프레임의 구조를 대담한 색면으로 재해석한 미드센츄리 AI 아트워크입니다.\n아이보리 바탕 위에서 블랙과 오렌지의 사선 모서리가 코발트 블루를 감싸며, 단순한 기하학 안에 깊이와 색의 긴장감을 만듭니다.","image":"assets/work-midcentury/frame.webp","prompt":"FRAME: Warm ivory background. One monumental geometric picture frame enclosing a large cobalt-blue center. Broad orange mitered border faces at top, right and bottom, a near-black left border and narrow inner rim, and a small ivory inset along the inside left edge. Crisp diagonal corner joints rendered as flat opaque color planes. Small condensed FRAME title with UNI / 2026 credit at upper left. Refined mid-century print design, subtle paper grain and restrained ink texture. No gradients, realistic rendering or extra objects."},
  {"title":"AFTER HOURS","category":"AI Artwork Collection","description":"깊은 밤의 고요함과 천체의 움직임을 담은 미드센츄리 AI 아트워크입니다.\n짙은 블루 위에 커다란 아이보리 행성과 작은 오렌지 위성을 배치하고, 사선으로 흐르는 궤도선으로 정적인 색면에 유연한 리듬을 더했습니다.","image":"assets/work-midcentury/after.webp","prompt":"AFTER HOURS: Deep midnight-blue background. A monumental warm ivory planet disk with two clean elliptical orbital lines sweeping diagonally around it, accompanied by one small burnt-orange satellite. Bold flat silhouettes, asymmetric balance and intentional negative space. Refined 1950s–1960s space-age print design with subtle paper grain and restrained offset ink texture. Small AFTER HOURS title and UNI / 2026 credit. No star field, realistic planet textures, gradients, glow or 3D."}
];
const dialog = document.querySelector('#project-dialog');
const dialogPanel = dialog.querySelector('.dialog-panel');
dialog.setAttribute('aria-labelledby', 'dialog-title');
let openingAnimation = null;
function clearProjectTransition() {
  openingAnimation?.cancel(); openingAnimation = null;
  dialog.classList.remove('is-opening');
}
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('focus', () => {
    if (!button.matches(':focus-visible') || !workSection.classList.contains('work-horizontal') || dialog.open) return;
    const cardLeft = button.offsetLeft - workTrack.offsetLeft;
    const cardRight = cardLeft + button.offsetWidth;
    const current = Math.max(0, Math.min(workDistance, workTop - workSection.getBoundingClientRect().top - workDelay));
    if (cardLeft < current || cardRight > current + workViewport.clientWidth) {
      const target = Math.min(workDistance, Math.max(0, cardLeft));
      window.scrollTo({ top: window.scrollY + workSection.getBoundingClientRect().top - workTop + workDelay + target, behavior: 'instant' });
    }
    workViewport.scrollLeft = 0;
    scheduleScroll();
  });
  button.addEventListener('click', async () => {
  if (dialog.open) return;
  clearProjectTransition();
  const source = button.querySelector('.project-image').getBoundingClientRect();
  const project = projects[Number(button.dataset.project)];
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-category').textContent = project.category;
  document.querySelector('#dialog-description').textContent = project.description;
  document.querySelector('#dialog-prompt').textContent = `${posterPrompt}\n\n${project.prompt}`;
  const image = document.querySelector('#dialog-image'); image.src = project.image; image.alt = `${project.title} 컨셉 디자인`;
  const animate = !reduceMotion.matches && Boolean(dialogPanel.animate);
  if (animate) dialog.classList.add('is-opening');
  lockBodyScroll();
  dialog.showModal(); dialogPanel.scrollTop = 0;
  dialog.querySelector('.dialog-content').scrollTop = 0;
  document.querySelector('#dialog-prompt').scrollTop = 0;
  if (!animate) return;
  const target = dialogPanel.getBoundingClientRect();
  const startX = source.left + source.width / 2 - target.left - target.width / 2;
  const startY = source.top + source.height / 2 - target.top - target.height / 2;
  const startScale = Math.max(.12, Math.min(.3, source.width / target.width * .4));
  // Animate the panel only so the close control stays visible and clickable.
  const animation = dialogPanel.animate([
    { transform: `perspective(1400px) translate3d(${startX}px,${startY}px,-700px) rotateX(35deg) rotateY(-250deg) scale(${startScale})`, opacity: 0, borderRadius: '32px', offset: 0 },
    { transform: `perspective(1400px) translate3d(${startX * .25}px,${startY * .25 - 30}px,-280px) rotateX(18deg) rotateY(-100deg) scale(.72)`, opacity: 1, borderRadius: '20px', offset: .42 },
    { transform: 'perspective(1400px) translate3d(0,0,45px) rotateX(-3deg) rotateY(9deg) scale(1)', opacity: 1, borderRadius: '6px', offset: .82 },
    { transform: 'perspective(1400px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)', opacity: 1, borderRadius: '0px', offset: 1 }
  ], { duration: 1100, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
  openingAnimation = animation;
  try { await animation.finished; } catch { /* Escape or dialog close cancels the flight. */ }
  if (openingAnimation === animation) clearProjectTransition();
});
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { clearProjectTransition(); unlockBodyScroll(); scheduleScroll(); });

// Use separate translate/rotate properties so pointer motion and scroll parallax coexist.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const hero = document.querySelector('.hero');
const heroTitle = document.querySelector('#hero-title');
const pointerShapes = [...accents, intro.querySelector('.halo')];
const tiltCards = [...document.querySelectorAll('.project')];
const pointerGroups = [
  [reflectionSection, [['#reflection-title', 18], ['.symbol', -30]]],
  [infoSpread, [['.art', -24]]],
  [interlude.querySelector('.frame'), [['.track', 18]]],
].map(([area, selectors]) => {
  const items = selectors.flatMap(([selector, distance]) => [...area.querySelectorAll(selector)].map(element => {
    element.classList.add('pointer-drift');
    return { element, distance };
  }));
  const reset = () => items.forEach(({ element }) => {
    element.style.removeProperty('--pointer-x');
    element.style.removeProperty('--pointer-y');
  });
  area.addEventListener('pointermove', event => {
    if (!finePointer.matches || reduceMotion.matches) return;
    const rect = area.getBoundingClientRect();
    const height = Math.min(rect.height, innerHeight);
    const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
    const y = Math.max(-.5, Math.min(.5, (event.clientY - Math.max(0, rect.top)) / height - .5));
    items.forEach(({ element, distance }) => {
      element.style.setProperty('--pointer-x', `${x * distance}px`);
      element.style.setProperty('--pointer-y', `${y * distance * .7}px`);
    });
  });
  area.addEventListener('pointerleave', reset);
  return { reset };
});
window.addEventListener('blur', () => {
  clearHeroPointer();
  pointerGroups.forEach(group => group.reset());
  tiltCards.forEach(card => {
    const image = card.querySelector('.project-image');
    image.style.removeProperty('--tilt-x');
    image.style.removeProperty('--tilt-y');
  });
});

// Fine radial ripples: 18px between rings, within 150px of the pointer.
const waveRadius = 150;
const waveNS = 'http://www.w3.org/2000/svg';
const waveSvg = document.createElementNS(waveNS, 'svg');
waveSvg.classList.add('wave-defs');
waveSvg.setAttribute('aria-hidden', 'true');
const waveCanvas = document.createElement('canvas');
waveCanvas.width = waveCanvas.height = waveRadius * 2;
const waveContext = waveCanvas.getContext('2d');
const wavePixels = waveContext.createImageData(waveCanvas.width, waveCanvas.height);
for (let y = 0; y < waveCanvas.height; y++) {
  for (let x = 0; x < waveCanvas.width; x++) {
    const dx = x + .5 - waveRadius;
    const dy = y + .5 - waveRadius;
    const distance = Math.hypot(dx, dy);
    const ripple = Math.sin(distance * Math.PI * 2 / 18) * Math.max(0, 1 - distance / waveRadius) ** 2 * 100;
    const index = (y * waveCanvas.width + x) * 4;
    wavePixels.data[index] = Math.round(128 + dx / (distance || 1) * ripple);
    wavePixels.data[index + 1] = Math.round(128 + dy / (distance || 1) * ripple);
    wavePixels.data[index + 2] = 128;
    wavePixels.data[index + 3] = 255;
  }
}
waveContext.putImageData(wavePixels, 0, 0);
const waveMap = waveCanvas.toDataURL();
const waveCandidates = [...document.querySelectorAll('h1, h2, h3, h4, p, a, span, img, svg, .image, .journal dl')].filter(element =>
  !element.closest('header, .progress, .scroll-link, .top-link, .skip, .backdrop, .journal .contents') &&
  (!element.closest('button, [role="button"]') || element.closest('.project')) &&
  (element.textContent.trim() || element.matches('img, svg, .image, .accent, .halo, .work-meter'))
);
const waveCandidateSet = new Set(waveCandidates);
const waves = waveCandidates.filter(element => {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (waveCandidateSet.has(parent)) return false;
  }
  return true;
}).map((element, index) => {
  if (getComputedStyle(element).display === 'inline') element.classList.add('wave-inline');
  const filter = document.createElementNS(waveNS, 'filter');
  filter.id = `pointer-wave-${index}`;
  filter.setAttribute('color-interpolation-filters', 'sRGB');
  filter.setAttribute('filterUnits', 'userSpaceOnUse');
  filter.innerHTML = '<feFlood flood-color="#808080" result="neutral"/><feImage preserveAspectRatio="none" result="wave"/><feMerge result="map"><feMergeNode in="neutral"/><feMergeNode in="wave"/></feMerge><feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G"/>';
  const map = filter.querySelector('feImage');
  map.setAttribute('href', waveMap);
  waveSvg.append(filter);
  return { element, filter, map, displacement: filter.lastElementChild, strength: 0, started: 0, applied: false, planet: element.matches('.type-dot') ? element : element.querySelector('.type-dot'), ringRadius: null };
});
document.body.append(waveSvg);
const visibleWaves = new Set();
const waveItems = new Map(waves.map(item => [item.element, item]));
const waveObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  const item = waveItems.get(entry.target);
  if (entry.isIntersecting) visibleWaves.add(item);
  else {
    visibleWaves.delete(item);
    item.strength = 0;
    if (item.applied) item.element.style.removeProperty('filter');
    item.applied = false;
  }
}), { rootMargin: waveRadius + 'px' });
waves.forEach(item => waveObserver.observe(item.element));
let waveFrame = 0;
let waveTime = 0;
let wavePointer;
let waveCenter;
function stopWaves() {
  cancelAnimationFrame(waveFrame);
  waveFrame = 0;
  wavePointer = null;
  waveCenter = null;
  waves.forEach(item => {
    item.strength = 0;
    if (item.applied) item.element.style.removeProperty('filter');
    item.applied = false;
  });
}
function drawWaves(time) {
  const elapsed = Math.min(time - waveTime, 64);
  const decay = Math.exp(-elapsed / 100);
  const follow = 1 - Math.exp(-elapsed / 180);
  waveTime = time;
  waveCenter.x += (wavePointer.x - waveCenter.x) * follow;
  waveCenter.y += (wavePointer.y - waveCenter.y) * follow;
  // Read layout first, then update SVG filters in a separate pass.
  const measured = [...visibleWaves].map(item => {
    const rect = item.element.getBoundingClientRect();
    const x = waveCenter.x - rect.left, y = waveCenter.y - rect.top;
    const near = rect.width && rect.height && x >= -waveRadius && y >= -waveRadius && x <= rect.width + waveRadius && y <= rect.height + waveRadius;
    if (!near) return { item, near };
    const sx = (item.element.offsetWidth || rect.width) / rect.width;
    const sy = (item.element.offsetHeight || rect.height) / rect.height;
    let padding = 24;
    if (item.planet) {
      const bounds = item.planet.getBoundingClientRect();
      if (item.ringRadius === null) {
        const ring = getComputedStyle(item.planet, '::before');
        item.ringRadius = Math.hypot(parseFloat(ring.width), parseFloat(ring.height)) / 2;
      }
      const extent = item.ringRadius * bounds.width / (item.planet.offsetWidth || bounds.width);
      const cx = bounds.left + bounds.width / 2, cy = bounds.top + bounds.height / 2;
      padding += Math.max(0, rect.left - cx + extent, cx + extent - rect.right, rect.top - cy + extent, cy + extent - rect.bottom);
    }
    return { item, near, rect, x, y, sx, sy, padding };
  });
  let active = false;
  measured.forEach(({ item, near, rect, x, y, sx, sy, padding }) => {
    item.strength *= decay;
    if (near) {
      item.filter.setAttribute('x', -padding * sx);
      item.filter.setAttribute('y', -padding * sy);
      item.filter.setAttribute('width', (rect.width + padding * 2) * sx);
      item.filter.setAttribute('height', (rect.height + padding * 2) * sy);
      item.map.setAttribute('x', (x - waveRadius) * sx);
      item.map.setAttribute('y', (y - waveRadius) * sy);
      item.map.setAttribute('width', waveRadius * 2 * sx);
      item.map.setAttribute('height', waveRadius * 2 * sy);
      if (item.strength < .2) item.started = time;
      item.strength = Math.max(item.strength, wavePointer.strength * Math.exp(-(time - wavePointer.time) / 140) * sx);
    }
    if (item.strength < .2) {
      if (item.applied) item.element.style.removeProperty('filter');
      item.applied = false;
      return;
    }
    item.displacement.setAttribute('scale', item.strength * Math.cos((time - item.started) / 90));
    if (!item.applied) item.element.style.filter = 'url("#' + item.filter.id + '")';
    item.applied = true;
    active = true;
  });
  waveFrame = active ? requestAnimationFrame(drawWaves) : 0;
}
window.addEventListener('pointermove', event => {
  if (!finePointer.matches || reduceMotion.matches || event.pointerType === 'touch') return;
  if (event.target.closest('header, .progress, .scroll-link, .top-link, .skip, .journal .contents, button:not(.project), [role="button"]')) { stopWaves(); return; }
  const now = performance.now();
  const elapsed = wavePointer ? Math.max(now - wavePointer.time, 8) : 16;
  const speed = wavePointer ? Math.hypot(event.clientX - wavePointer.x, event.clientY - wavePointer.y) / elapsed : 0;
  wavePointer = { x: event.clientX, y: event.clientY, time: now, strength: Math.min(36, 14 + speed * 14) };
  if (!waveCenter) waveCenter = { x: event.clientX, y: event.clientY };
  if (!waveFrame) {
    waveTime = now;
    waveFrame = requestAnimationFrame(drawWaves);
  }
}, { passive: true });
window.addEventListener('blur', stopWaves);
window.addEventListener('resize', () => { stopWaves(); waves.forEach(item => { item.ringRadius = null; }); });
window.addEventListener('scroll', stopWaves, { passive: true });
document.documentElement.addEventListener('pointerleave', stopWaves);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopWaves(); });

function clearHeroPointer() {
  heroTitle.style.removeProperty('translate');
  pointerShapes.forEach(shape => shape.style.removeProperty('translate'));
}
function clearPointerMotion() {
  stopWaves();
  clearHeroPointer();
  pointerGroups.forEach(group => group.reset());
  tiltCards.forEach(card => {
    const image = card.querySelector('.project-image');
    image.style.removeProperty('--tilt-x');
    image.style.removeProperty('--tilt-y');
  });
}
function syncMotion() {
  const disabled = reduceMotion.matches;
  document.documentElement.classList.toggle('motion-off', disabled);
  if (disabled || !finePointer.matches) clearPointerMotion();
  if (disabled) clearProjectTransition();
  measureWork();
  scheduleScroll();
}
reduceMotion.addEventListener('change', syncMotion);
finePointer.addEventListener('change', syncMotion);
syncMotion();

hero.addEventListener('pointermove', event => {
  if (!finePointer.matches || reduceMotion.matches) return;
  const bounds = hero.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - .5;
  const y = (event.clientY - bounds.top) / bounds.height - .5;
  heroTitle.style.translate = `${x * 18}px ${y * 12}px`;
  pointerShapes.forEach((shape, index) => {
    const distance = [20, 32, 24, 16][index];
    shape.style.translate = `${-x * distance}px ${-y * distance}px`;
  });
});
hero.addEventListener('pointerleave', clearHeroPointer);
tiltCards.forEach(card => {
  const image = card.querySelector('.project-image');
  card.addEventListener('pointermove', event => {
    if (!finePointer.matches || reduceMotion.matches) return;
    const rect = card.getBoundingClientRect();
    const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
    const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
    image.style.setProperty('--tilt-x', `${-y * 9}deg`);
    image.style.setProperty('--tilt-y', `${x * 9}deg`);
  });
  card.addEventListener('pointerleave', () => {
    image.style.removeProperty('--tilt-x');
    image.style.removeProperty('--tilt-y');
  });
});
// Pause repeating CSS motion outside the viewport and when the tab is hidden.
const animatedSections = [hero];
const animationObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  entry.target.classList.toggle('motion-outside', !entry.isIntersecting);
}));
animatedSections.forEach(el => animationObserver.observe(el));
document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('tab-hidden', document.hidden));

document.querySelectorAll(' .project-image img').forEach(image => image.addEventListener('load', () => { measureWork(); scheduleScroll(); }));
