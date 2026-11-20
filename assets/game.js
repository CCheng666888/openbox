"use strict";

const stage = document.querySelector("#stage");
const storageKey = "hongma-independent-stories-1";
let cleared = readCheckpoint();
let chapter = 0;
let view = "home";
let sourcesReturn = "home";
let work = freshWork();
let selected = null;
let hint = 0;
let feedback = "";
let altered = false;
let hashState = null;
let hashAttempt = 0;

function readCheckpoint() {
  try {
    const values = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(values)) return new Set(values.filter(i=>Number.isInteger(i)&&i>=0&&i<chapters.length));
  } catch { /* Some file browsers disallow local storage. */ }
  return new Set();
}
function saveCheckpoint() {
  try { localStorage.setItem(storageKey,JSON.stringify([...cleared])); } catch { /* Optional local progress. */ }
}
function control(action,label,type="",value="",key=action) {
  return `<button class="btn ${type}" type="button" data-action="${action}" data-value="${value}" data-key="${key}">${label}</button>`;
}
function link(url,label) {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
}
function route() {
  const item = chapters[chapter];
  return `<div class="story-nav">${control("directory","← 故事目录","simple")}<span>${item.year} · ${item.place}</span></div>`;
}
function evidenceCard(item) {
  const e = item.evidence;
  return `<article class="history-card folio-evidence">
    <div class="eyebrow">档案原文 · 节录</div><h2>${e.doc}</h2><div class="doc-date">${e.date}</div>
    <blockquote>“${e.quote}”</blockquote><p>${item.history}</p>
    <div class="citations">${link(e.source.url,e.source.org+" · "+e.source.title)}
    ${e.extra ? link(e.extra[0].url,e.extra[1]) : ""}
    ${e.image ? link(e.image,e.imageCaption) : ""}</div>
  </article>`;
}
function homePage() {
  return `<section class="hero history-hero">
    <div class="hero-text"><div class="eyebrow">中央文库 · 上海</div>
      <h1>开箱必读</h1><h2>七个独立的档案故事</h2>
      <p>选一个场景，接手当时的一项工作。解开谜题后，翻看这一段历史和档案影像。</p>
    </div>
    <div class="cover-docs" aria-hidden="true"><img src="${historyCards[0].image}" alt=""><img src="${historyCards[6].image}" alt=""></div>
    <div class="art-credit">档案影像 · 上海市档案馆藏</div>
  </section><section class="story-index" aria-label="故事目录">
    <div class="index-heading"><h2>任选一个故事</h2><p>已完成 ${cleared.size} / ${chapters.length}</p></div>
    <div class="story-cards">${options(chapters,(item,i)=>`
      <button class="story-choice" type="button" data-action="begin" data-key="begin-${i}" data-value="${i}">
        <span><b>${item.year}</b>${cleared.has(i)?"<small>已完成</small>":""}</span>
        <strong>${item.title}</strong><span>${item.role}<i aria-hidden="true">→</i></span>
      </button>`)}</div></section>`;
}
function storyPage(item) {
  return `${route()}<section class="chapter-header"><div class="eyebrow">独立故事 · ${item.role}</div>
  <h1>${item.title}</h1></section>
  <div class="story-grid">${evidenceCard(item)}<article class="scene-card"><div class="eyebrow">情境演绎 · 你是${item.role}</div>
    <p>${item.scene}</p><div class="assignment">${item.goal}</div>
    ${control("enter","接手这一站 →","brass")}</article></div>`;
}
function showHints() {
  const notes = chapters[chapter].hints;
  return `<div class="hint">${hint?`<ol>${options(notes.slice(0,hint),note=>"<li>"+note+"</li>")}</ol>`:""}
    ${hint<notes.length?control("hint",hint?"再看一步":"卡住了？看提示","simple"):""}</div>`;
}
function deskPage(item) {
  const held = selected === null ? "" : ({
    0: () => coverFiles[selected].name,
    3: () => strips[selected].left + " — " + strips[selected].right
  })[chapter]?.();
  return `${route()}<section class="task-header"><div><div class="eyebrow">${item.year} / ${item.role}</div>
     <h1>${item.title}</h1><p>${item.goal}</p></div>${control("story","回看档案原文","simple")}</section>
     <div class="desk-grid">${puzzleViews[chapter]()}</div>
     ${[0,3].includes(chapter) ? `<div class="mobile-carry">
       <span>${held ? "手中有 · " + held : "手中未持纸件"}</span>
       ${control("scroll-desk",held?"去放置 →":"回取纸件 ↑","simple",held?"work":"clue")}</div>` : ""}`;
}
function resultPage(item) {
  return `${route()}<section class="result">
    <div class="big-stamp">${chapter === chapters.length-1?"签收":"存卷"}</div>
    <div class="eyebrow">${item.year} · 故事完成</div><h1>${item.title}</h1><p>${item.outcome}</p>
    <div class="reward">${item.reward}</div><div class="actions centered">${control("view-history","再看本关史实","green")}
    ${control("begin","重玩本关","simple",chapter)}</div>
  </section>${historyDialog(historyCards[chapter],item)}`;
}
function historyDialog(card,item) {
  const last = chapter === chapters.length-1;
  return `<dialog class="history-dialog" aria-labelledby="history-title">
    <header class="history-top"><div class="eyebrow">故事完成 · ${item.year} 史实</div>
      ${control("close-history","关闭","simple")}</header>
    <div class="history-body">
      <figure><img src="${card.image}" alt="${card.caption}"><figcaption>${card.caption}<small>${card.credit}</small></figcaption></figure>
      <article><h2 id="history-title">${card.title}</h2><p>${card.text}</p>
        <blockquote>“${item.evidence.quote}”</blockquote>
        <div class="citations">${link(card.source,"查看配图出处")}${link(item.evidence.source.url,"阅读史实出处")}</div>
      </article>
    </div><footer class="history-actions">${last?control("lab","试试数字核验","simple"):""}${control("directory","回故事目录 →","green")}</footer>
  </dialog>`;
}
function showHistory() {
  const dialog = stage.querySelector("dialog");
  if (dialog && !dialog.open) {
    dialog.showModal();
    dialog.scrollTop=0;
  }
}
function sourcesPage() {
  return `<section class="chapter-header"><div class="eyebrow">阅读原文</div><h1>史料案卷</h1>
     <p>这里收录七个故事的原文短摘。柜签、谜题数据和玩家行动均为情境演绎。</p>${control("back","← 返回原处","simple")}</section>
     <div class="source-list archive-list">${options(chapters,evidenceCard)}</div>`;
}
function labPage() {
  const copy = receiptText(loads.map(x=>altered?x.received:x.sent));
  let readout = "";
  if (hashState?.error) readout = hashState.error;
  if (hashState?.reference) {
    const {reference, current} = hashState;
    readout = `<p><b>${reference===current?"与留底一致":"与留底不一致"}</b></p>
      <dl><dt>留底摘要</dt><dd>${reference}</dd><dt>接收摘要</dt><dd>${current}</dd></dl>`;
  }
  return `<section id="lab" class="paper lab" tabindex="-1"><div class="eyebrow">现代信息安全实验</div>
   <h2>两份收据总数相同，摘要呢？</h2><p>用 SHA-256 对留底与接收文件分别计算摘要。切换到改写前的接收联后，两份文本的总包数仍为 22。</p>
   <pre>${copy}</pre><div class="actions">${control("alter",altered?"恢复已签收副本":"切换到改写过的接收联","simple")}
   ${control("hash","计算并比对摘要","green")}</div><div class="hash-readout" aria-live="polite">${readout}</div>
   <p class="lab-note">参照值来源可信时，摘要可以协助检查字节变化。签发者身份需要独立认证。</p></section>`;
}
function endingPage() {
  return `${route()}${labPage()}`;
}
function render(focusKey="") {
  const item = chapters[chapter];
  const pages = {home:homePage, story:storyPage, desk:deskPage, result:resultPage, sources:sourcesPage, ending:endingPage};
  stage.innerHTML = pages[view](item);
  if (focusKey) [...stage.querySelectorAll("[data-key]")].find(x=>x.dataset.key===focusKey)?.focus({preventScroll:true});
}
function navigate(next) {
  view=next;
  render();
  stage.focus({preventScroll:true});
  window.scrollTo(0,0);
}
function complete() {
  cleared.add(chapter);
  selected=null;
  feedback="";
  saveCheckpoint();
  navigate("result");
  showHistory();
}
function openSources() {
  if (view==="sources") return;
  sourcesReturn=view;
  navigate("sources");
}
const actions = {
  begin(value) {
    chapter=Number(value);
    work=freshWork();selected=null;hint=0;feedback="";
    altered=false;hashState=null;hashAttempt++;
    navigate("story");
  },
  directory() { navigate("home"); },
  enter() { navigate("desk"); },
  story() { navigate("story"); },
  hint() { hint++; },
  back() { navigate(sourcesReturn); },
  "view-history":showHistory,
  "close-history"() { stage.querySelector("dialog")?.close(); },
  "scroll-desk"(target) { stage.querySelector(target==="work"?".tabletop":".clues").scrollIntoView({block:"start"}); },
  lab() { navigate("ending"); },
  alter() { altered=!altered;hashState=null;hashAttempt++; },
  async hash() {
    const attempt=++hashAttempt;
    try {
      const [reference,current] = await Promise.all([
        digest(receiptText(loads.map(x=>x.sent))),digest(receiptText(loads.map(x=>altered?x.received:x.sent)))
      ]);
      if (attempt!==hashAttempt) return;
      hashState={reference,current};
    } catch {
      if (attempt!==hashAttempt) return;
      hashState={error:"当前浏览器未开放本地摘要功能。可在新版 Edge 或 Chrome 中试验。"};
    }
    if (view==="ending") render("hash");
  }
};

stage.addEventListener("click",event=>{
  const button=event.target.closest("[data-action]");
  if (!button) return;
  const action=button.dataset.action;
  (actions[action] || puzzleActions[action])(button.dataset.value);
  if (button.isConnected && !["view-history","close-history","hash","scroll-desk"].includes(action)) render(button.dataset.key);
});
document.querySelector("#home").addEventListener("click",()=>navigate("home"));
document.querySelector("#sources").addEventListener("click",openSources);
render();
