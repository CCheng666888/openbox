"use strict";

const {fields, cases, modes, review, preview, release, digest} = ArchivePolicy;
const main = document.querySelector("main");
const drafts = new Map(cases.map(task => [task.id, {choices: fields.map(() => 0), checked: false, seal: null}]));
const finished = new Set();
let currentTask = cases[0];
let notice = "";
let revision = 0;
const glyphs = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  external: '<path d="M5 18 18 5M7 5h11v11"/>',
  exhibit: '<path d="M3 20h18M5 17h14v3M5 17V6h14v11M8 13l3-3 3 3 2-2 3 3"/><circle cx="9" cy="8.5" r=".7"/>',
  repair: '<path d="m4 19 4-1 11-11-3-3L5 15l-1 4zm9-12 3 3M4 21h16"/>',
  shelf: '<path d="M3 3h18v18H3zM3 12h18M7 5v5m3-5v5m4-4 2 4m1 4v5m-3-5v5m-7-4v4"/>',
  book: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v14"/>',
  file: '<path d="M6 2h8l4 4v16H6zM14 2v5h4M9 12h6m-6 4h6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  shield: '<path d="M12 2 4 5v6c0 5 4 8 8 11 4-3 8-6 8-11V5z"/><path d="m8 12 3 3 5-6"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>'
};
function icon(key) {
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + glyphs[key] + '</svg>';
}
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sources = [
  {year: "1931", name: "为文件定下整理办法", body: "瞿秋白受周恩来委托起草《文件处置办法》，明确哪些文件应当收集、怎样分类编目。文件能被查到、用对，从整理时就要开始考虑。", org: "赣州市档案馆", title: "从“向荣面坊”到中央档案馆：中央文库“完璧归党”始末（上）", url: "https://dag.ganzhou.gov.cn/c102015/202107/03a63cb018bc405693f3e7d85c65bf87.shtml"},
  {year: "1932", name: "守护文库的接力", body: "这一年，陈为人、韩慧英承担起中央文库的保管工作。在此后的整理中，为便于查阅，文件经过分类编目，目录和查阅须知列入“开箱必读”。作品的名字由此而来。", org: "吉林省国家保密局", title: "她的曾外祖父大名鼎鼎：富商身份掩护中央最高机密，常备火炉时刻准备与之俱焚", url: "https://bmj.jl.gov.cn/xcjy/202501/t20250123_3358688.html"},
  {year: "1949", name: "清点之后，留下一张收据", body: "陈来生将保管的中央文库档案移交。接收人员检查后写下收据，记载了点收的包数、箱数和保存状况。今天的实验借用“交接时核对”这一动作，让你用摘要比较数字副本。", org: "赣州市档案馆", title: "从“向荣面坊”到中央档案馆：中央文库“完璧归党”始末（上）", url: "https://dag.ganzhou.gov.cn/c102015/202107/03a63cb018bc405693f3e7d85c65bf87.shtml"}
];
function ext(url, label) {
  return '<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' '+icon("external")+'</a>';
}
function caseCard(task) {
  return `<a class="case" href="#desk/${task.id}"><div class="case-top"><span class="icon-box">${icon(task.icon)}</span><span class="folio">${finished.has(task.id) ? "已交接 · " : ""}委托 / ${task.number}</span></div><h3>${task.title}</h3><p>${task.teaser}</p><div class="case-foot"><span>${task.label}</span>${icon("arrow")}</div></a>`;
}
function home() {
  return `<section class="hero"><div class="hero-art" role="img" aria-label="创作插图，打开的档案盒与棉线装订的纸张"></div><div class="hero-text"><div class="over light"><i></i> 党史中的信息安全</div><h1>开箱必读</h1><h2>一份档案，可以交给谁？</h2><p>从中央文库的一册查阅指南出发，亲手为不同接收人整理一份恰到好处的档案副本。</p><div class="actions"><a class="button brass" href="#desk/visitor">打开第一份委托 ${icon("arrow")}</a><a class="hero-link" href="#history">读题名背后的故事</a></div></div><span class="art-credit">档案盒意象 · 创作插图</span></section>
    <section class="missions"><div class="section-title"><div class="over"><i></i> 交接工作台</div><span class="count">本次已完成 <b>${finished.size} / 3</b></span></div><h2>选择一份委托</h2><div class="case-grid">${cases.map(caseCard).join("")}</div></section>`;
}
function history() {
  return `<section class="page-head"><div class="over"><i></i> 阅览室 / 馆藏读本</div><h1>史料索引</h1><p>沿着编目、查阅和点收三个动作，读懂本作的历史来处。</p></section><div class="history-layout"><div class="timeline">${sources.map(s=>`<article><div class="year">${s.year}</div><div><h2>${s.name}</h2><p>${s.body}</p><p class="source">${ext(s.url,s.org+" · "+s.title)}</p></div></article>`).join("")}</div>
    <aside class="source-note"><div class="over light"><i></i> 从纸页到字节</div><h2>今天怎样交接？</h2><p>三个委托发生在虚构的当代展览中。按用途选择字段，是对最小必要披露的练习；核对 SHA-256，则演示数字副本的完整性检查。</p><p>摘要的参照值须可信。确认签发人的身份还需要数字签名等独立机制。</p><div class="refs">${ext("https://csrc.nist.gov/glossary/term/SHA_256","NIST · SHA-256")}${ext("https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-160v1r1.pdf","NIST · 最小权限原则（E.16）")}</div><a class="button brass" href="#desk/visitor">试着做一份展签 ${icon("arrow")}</a></aside></div>`;
}
function taskHead(task, verify) {
  return `<div class="task-nav"><a class="return" href="#home">${icon("back")} 阅览室</a><div class="task-tabs" aria-label="切换委托">${cases.map(t=>`<a href="#desk/${t.id}" ${t===task?'aria-current="true"':''}>${t.label}</a>`).join("")}</div></div>
  <section class="brief"><div class="brief-icon">${icon(task.icon)}</div><div><div class="over light"><i></i> 委托 ${task.number} / 接收人 · ${task.role}</div><h1>${task.title}</h1><p>${task.brief}</p></div><div class="stamp"><b>${verify ? "核验" : "待办"}</b><span>教学模拟</span></div></section>`;
}
function feedback(task, draft) {
  if (!draft.checked) return "";
  const issues = review(task,draft.choices);
  const over = issues.filter(i => i.type === "披露过多").length;
  if (!issues.length) return "字段已符合委托，可以签发。";
  return `请复核 ${issues.length} 栏：${over} 栏披露过多，${issues.length - over} 栏信息不足。`;
}
function previewBox(task, draft) {
  const rows = preview(draft.choices);
  return `<div class="paper-head"><span class="folio">交接联 / ${task.number}</span>${icon("file")}</div><h2>接收方预览</h2><p class="to">交付给　<b>${task.role}</b></p><dl class="preview-list">${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("") || '<div class="empty"><p>副本暂时为空。<br>选择要写入的字段，内容会在这里出现。</p></div>'}</dl><div class="paper-bottom"><span>将写入 <b>${rows.length}</b> 项字段</span><span>模拟副本</span></div>`;
}
function row(task, draft, f, i) {
  const problem = draft.checked && review(task,draft.choices).find(item=>item.key===f.key);
  return `<div class="field ${problem ? "has-issue":""}"><div class="field-label"><strong id="label-${f.key}">${f.label}</strong><span>${escapeHtml(f.full)}</span></div><div class="segments" role="group" aria-labelledby="label-${f.key}">${modes.map((m,j)=>`<button type="button" data-field="${i}" data-mode="${j}" aria-pressed="${draft.choices[i]===j}">${m}</button>`).join("")}</div>${problem ? `<p class="issue"><b>${problem.type}</b> · ${problem.reason}</p>`:""}</div>`;
}
function desk(task) {
  const draft=drafts.get(task.id);
  return taskHead(task,false)+`<div class="work-grid"><section class="work-panel"><div class="panel-title"><div><div class="over"><i></i> 第一步 / 字段处理</div><h2>编辑交接副本</h2></div><span class="folio">模拟底稿</span></div><p class="help">逐栏选择披露程度。概括会改写为预设的较粗信息。</p><div id="fields">${fields.map((f,i)=>row(task,draft,f,i)).join("")}</div></section><aside class="work-side"><div class="paper" id="preview">${previewBox(task,draft)}</div><div class="controls"><button class="button dark" id="seal">复核并签发 ${icon("arrow")}</button><p class="status" id="message" role="status">${escapeHtml(notice || feedback(task,draft))}</p></div></aside></div>`;
}
function addReadingNote(task) {
  const entries = {
    visitor: ["查阅前先看目录","中央文库曾列出查阅须知和目录。试想把一条目录改写成公共展签，哪些词足以让观众辨认展件？"],
    repair: ["每一页，都要保管好","中央文库交接收据记下了纸张的保存状况。在今天的修复工单里，纸页上一个裂口的位置也会影响下一步工作。"],
    audit: ["把数量点清楚","1949 年的交接收据写明了点收的箱数和包数。今天盘点模拟展件时，你也需要足以区分同批展件的信息。"]
  };
  const [title, body] = entries[task.id];
  main.querySelector(".work-side").insertAdjacentHTML("beforeend", `<div class="reading-note"><div class="over"><i></i> 守档手记</div><h3>${title}</h3><p>${body}</p><a class="minor" href="#history">查看史料出处 ${icon("external")}</a></div>`);
}
function addFileCheck() {
  main.querySelector(".verify-grid .work-panel").insertAdjacentHTML("beforeend",
    '<details class="file-check"><summary>用签发留底复验本地文件</summary><p>选择本实验导出的 JSON（最多 64 KiB）。按文件原始字节核验，换行或编码变化也会影响结果。文件只在本机读取。</p><input id="local-file" aria-label="选择导出的模拟副本" type="file" accept=".json,application/json"><p id="file-result" role="status"></p></details>');
}
let fileEpoch = 0;
main.addEventListener("change", async event => {
  if (event.target.id !== "local-file") return;
  const output = document.getElementById("file-result");
  const file = event.target.files[0];
  const epoch = ++fileEpoch;
  if (!file) { output.textContent = ""; return; }
  if (file.size > 65536) { output.textContent = "文件超出 64 KiB，请选择本实验的模拟副本。"; return; }
  const reference = drafts.get(currentTask.id).seal.reference;
  try {
    const actual = await digest(await file.arrayBuffer());
    if (epoch !== fileEpoch || !output.isConnected) return;
    output.textContent = (actual === reference ? "本地文件与签发留底一致。" : "本地文件与签发留底不一致。") + " SHA-256 · " + actual;
  } catch { if (epoch === fileEpoch && output.isConnected) output.textContent = "未能读取并核验文件，请重新选择。"; }
});
function verify(task) {
  const draft = drafts.get(task.id);
  const seal = draft.seal;
  const edited = seal.received !== seal.original;
  const result = seal.result;
  const checked = result === "match" || result === "different";
  const verdict = result === "match" ? "校验一致" : result === "different" ? "校验不一致" : "等待核验";
  const explanation = result === "match" ? "两个摘要相同，本次接收副本与签发副本的字节一致。" : result === "different" ? "接收副本的摘要与签发留底不同。请重新取得原副本再核验。" : "计算接收副本的摘要，与独立留存的签发摘要逐字节核对。";
  return taskHead(task,true)+`<div class="work-grid verify-grid"><section class="work-panel"><div class="panel-title"><div><div class="over"><i></i> 第二步 / 完整性核验</div><h2>核对接收副本</h2></div>${icon("shield")}</div><p class="help">点“模拟改动一字”把用途中的“样本”换成“样木”，观察核验结果。</p><div class="code-head"><span>接收文件 · JSON</span><span>${edited ? "已模拟改动" : "签发版本"}</span></div><pre class="copy">${escapeHtml(seal.received)}</pre><div class="actions"><button id="alter" class="button hollow">${edited ? "恢复签发副本" : "模拟改动一字"}</button><button id="verify" class="button dark">计算并核验 ${icon("arrow")}</button></div></section>
  <aside class="work-side"><section class="paper check-paper"><div class="paper-head"><span class="folio">核验联 / ${task.number}</span>${icon("shield")}</div><div class="verdict ${result || ""}">${verdict}</div><p class="explain">${explanation}</p><div class="hash"><b>签发时留底 · SHA-256</b><code>${seal.reference}</code></div><div class="hash"><b>接收时计算 · SHA-256</b><code>${checked ? seal.actual : "尚未计算"}</code></div><p class="small">参照值须来自可信渠道。单独一串摘要无法证明签发者身份。</p></section><div class="controls"><p id="message" role="status" class="status">${escapeHtml(notice)}</p>${result==='match' ? `<div class="actions"><button id="save" class="button dark">保存核验副本</button><a class="button hollow" href="${task===cases[2]?'#home':'#desk/'+cases[cases.indexOf(task)+1].id}">${task===cases[2]?'返回阅览室':'下一份委托'} ${icon("arrow")}</a></div>` : ""}<a class="minor" href="#desk/${task.id}">返回编辑字段</a></div></aside></div>`;
}
function route() {
  revision++;
  const [page, id] = location.hash.slice(1).split("/");
  const task=cases.find(t=>t.id===id) || currentTask;
  currentTask=task;
  const draft=drafts.get(task.id);
  const openDesk=page==="desk" || page==="verify";
  const active=openDesk?"desk":page==="history"?"history":"home";
  document.querySelectorAll("[data-nav]").forEach(a=>{
    if (a.dataset.nav===active) a.setAttribute("aria-current","page");
    else a.removeAttribute("aria-current");
    if (a.dataset.nav==="desk") a.href="#desk/"+task.id;
  });
  const showVerify=page==="verify" && draft.seal;
  main.innerHTML = openDesk ? (showVerify ? verify(task):desk(task)) : (active==="history"?history():home());
  if (openDesk && !showVerify) addReadingNote(task);
  if (showVerify) addFileCheck();
  document.title = (openDesk?(showVerify?"核验副本":"编辑副本")+" · "+task.label:active==="history"?"史料索引":"阅览室")+" | 开箱必读";
}
function status(message) {
  const box=document.getElementById("message");
  if (box) box.textContent=message;
}
function refreshFields(task, draft, focusIndex, focusMode) {
  document.getElementById("fields").innerHTML=fields.map((f,i)=>row(task,draft,f,i)).join("");
  document.getElementById("preview").innerHTML=previewBox(task,draft);
  status(feedback(task,draft));
  if (focusIndex!==undefined) main.querySelector('[data-field="'+focusIndex+'"][data-mode="'+focusMode+'"]').focus({preventScroll:true});
}
main.addEventListener("click", async event => {
  const button = event.target.closest("button");
  if (!button) return;
  const task=currentTask;
  const draft=drafts.get(task.id);
  if (button.hasAttribute("data-field")) {
    revision++;
    draft.choices[Number(button.dataset.field)] = Number(button.dataset.mode);
    draft.seal=null;
    notice="";
    refreshFields(task,draft,button.dataset.field,button.dataset.mode);
    return;
  }
  const token=++revision;
  try {
    if (button.id==="seal") {
      draft.checked=true;
      if (review(task,draft.choices).length) {
        refreshFields(task,draft);
        main.querySelector(".has-issue button[aria-pressed=true]")?.focus();
        return;
      }
      const original=release(task,draft.choices);
      const reference=await digest(original);
      if (token!==revision) return;
      draft.seal={original,received:original,reference,actual:"",result:null};
      const target="#verify/"+task.id;
      if (location.hash===target) route();
      else location.hash=target;
    } else if (button.id==="alter") {
      const seal=draft.seal;
      seal.received=seal.received===seal.original ? seal.original.replace("虚构教学样本","虚构教学样木") : seal.original;
      seal.actual="";seal.result=null;notice="接收副本已更新，请重新核验。";route();
      document.getElementById("verify").focus({preventScroll:true});
    } else if (button.id==="verify") {
      const seal=draft.seal;
      const actual=await digest(seal.received);
      if (token!==revision) return;
      seal.actual=actual;
      seal.result=actual===seal.reference?"match":"different";
      if (seal.result==="match") finished.add(task.id);
      notice=seal.result==="match"?"核验一致，可以保存副本。":"核验不一致，已暂停交付。";
      route();document.querySelector(".verdict").setAttribute("tabindex","-1");document.querySelector(".verdict").focus({preventScroll:true});
    } else if (button.id==="save" && draft.seal?.result==="match") {
      const file = new Blob([draft.seal.received],{type:"application/json;charset=utf-8"});
      const url=URL.createObjectURL(file);
      const a=document.createElement("a");
      a.href=url;a.download="教学副本-"+task.label+".json";
      document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
      status("已生成 JSON 文件，可用文本编辑器查看实际交付内容。");
    }
  } catch (error) { if (token===revision) status(error.message || "处理失败，请重试。"); }
});
window.addEventListener("hashchange",()=>{
  notice="";route();main.focus({preventScroll:true});window.scrollTo(0,0);
});
route();
