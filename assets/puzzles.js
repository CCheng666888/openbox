"use strict";

const chronology = [2,4,0];
const chain = [2,1,0,4,3];
const inventoryTargets = [4,5,7,6];
const dispatchTargets = [1,0];
const wireTable = [
  ["山","乙","甲","丙"], ["河","甲","丙","乙"],
  ["舟","午","辰","酉"], ["灯","辰","酉","午"], ["云","酉","午","辰"]
];

function blank(n) {
  return Array(n).fill(null);
}
function freshWork() {
  return {
    opened:[], sent:blank(3), circles:new Set(), dials:[0,0,0],
    glued:blank(5), joined:false, box:"", seal:"", inventory:[4,0,0,0],
    copied:[], openedLedger:false, counts:loads.map(load => load.received)
  };
}

function options(values, make) {
  return values.map(make).join("");
}
function slot(label, id, action, index, text) {
  return control(action, `<small>${label}</small><b>${id === null ? "放入手中的纸件" : text(id)}</b>`,
    "slot " + (id === null ? "" : "filled"), index, action + "-" + index);
}
function piece(action,id,label,content) {
  return `<button class="piece" type="button" data-action="${action}" data-value="${id}" data-key="${action}-${id}" aria-pressed="${selected === id}">
    <span>${label}</span><b>${content}</b></button>`;
}
function numerical(action, i, value, label) {
  return `<div class="counter">${control(action,'−<span class="sr">'+label+'减一</span>',"simple",i+":-1",action+"-"+i+"-minus")}
   <span class="quantity" aria-label="${label} ${value}">${value}</span>
   ${control(action,'+<span class="sr">'+label+'加一</span>',"simple",i+":1",action+"-"+i+"-plus")}</div>`;
}
function clues(title, contents) {
  return `<aside class="paper clues"><div class="eyebrow">手边材料</div><h2>${title}</h2>${contents}${showHints()}</aside>`;
}
function sheet(eyebrow,title,contents) {
  return `<section class="tabletop"><div class="eyebrow">${eyebrow}</div><h2>${title}</h2>${contents}<p class="feedback" role="status">${feedback}</p></section>`;
}
function fileDesk() {
  const index = work.opened.at(-1);
  const item = coverFiles[index];
  return clues("待处理卷签",
    `<p>点击卷签展开内页，再点击右侧的归库格。格内卷签可点回桌面。</p><div class="pieces">
    ${options(coverFiles,(file,i)=>work.sent.includes(i)?"":piece("peek",i,file.mark,file.name))}</div>
    ${item ? `<div class="unfolded"><b>${item.name}</b><p>卷签日期 · ${item.date}　｜　${item.status}</p></div>` : ""}`) +
    sheet("文书桌","归库收条",
      `<div class="slots">${options(work.sent,(id,i)=>slot("第 "+(i+1)+" 格",id,"bind",i,n=>coverFiles[n].name))}</div>
        ${control("submit-file","把归库卷绑定收条","green")}`);
}
function folioDesk() {
  const characters = (line, row) => options([...line.copy],(char,col)=>{
    const id = row + ":" + col;
    return `<button class="proof-glyph" type="button" data-action="circle" data-value="${id}" data-key="circle-${id}" aria-pressed="${work.circles.has(id)}"
      aria-label="${line.mark}卷抄本第 ${col+1} 字，${char}">${char}</button>`;
  });
  return clues("校对便笺",
    '<p>把两行当尺子，从头对到尾。上行是留库正本，下行是准备交给阅览桌的试抄件。</p><p>圈记相异位置。相邻两字颠倒时，两处都要圈。</p>') +
    sheet("誊抄桌 · 模拟文书","两份逐字对读",
      `<div class="proof-lines">${options(proofLines,(line,row)=>`<section><h3>${line.mark}卷</h3>
        <div class="proof-row"><span class="proof-label">正本</span><div class="proof-grid">${options([...line.original],char=>"<span>"+char+"</span>")}</div></div>
        <div class="proof-row"><span class="proof-label">抄本</span><div class="proof-grid">${characters(line,row)}</div></div>
      </section>`)}</div>
      <div class="proof-controls">${control("submit-folio","按正本誊正","green")}
      ${control("clear-circles","清空圈记","simple")}<span>已圈记 ${work.circles.size} 处</span></div>`);
}
function dialDesk() {
  return clues("桌上的暗签",
    `<div class="ticket">${catalogue.map(x=>x.code).join(" · ")}</div><p>目录按栏读取。先看每一栏的书写方向。</p>
      <div class="index-slips">${options(catalogue,column=>`<section><h3>${column.label}</h3>
        <div class="direction">${column.reverse?"从右往左":"从左往右"}</div><div class="order-items">${column.items.join(" · ")}</div></section>`)}</div>`) +
      `<section class="cabinet"><div class="eyebrow">编目柜</div><h2>拨动索引</h2>
      <div class="dials">${options(catalogue,(column,i)=>`<div class="dial"><div class="dial-label">${column.label}</div><div class="dial-rail">
        ${control("dial",'‹<span class="sr">上一项'+column.label+'</span>',"dial-knob",i+":-1","dial-"+i+"-prev")}
        <strong>${column.items[work.dials[i]]}</strong>
        ${control("dial",'›<span class="sr">下一项'+column.label+'</span>',"dial-knob",i+":1","dial-"+i+"-next")}
      </div></div>`)}</div><div class="drawer"><span></span></div>
      ${control("submit-dial","拉开柜屉","brass")}<p class="feedback" role="status">${feedback}</p></section>`;
}
function seamDesk() {
  const line = work.glued.map(i=>strips[i]?.middle || "□").join("");
  const wax = (action,list,current) => options(list,x=>`<button type="button" class="btn simple" data-action="${action}" data-value="${x}" data-key="${action+x}" aria-pressed="${current===x}">${x}</button>`);
  return clues("书脊拓印",
    `<div class="spine"><span>起</span><i>— 五段骑缝 —</i><span>止</span></div><p>各段左、右两边有接合记号。点击一片，再点右侧空格。多出的一片留在桌上。</p>
    <div class="pieces">${options(strips,(s,i)=>work.glued.includes(i)?"":piece("seam",i,s.left+" ─ "+s.right,s.middle))}</div>`) +
    sheet("裁纸桌","接合骑缝",
      `<div class="slots seam-slots ${work.joined?"joined":""}">${options(work.glued,(id,i)=>slot("第 "+(i+1)+" 段",id,"glue",i,n=>{
        const strip = strips[n];
        return '<span class="seam-ink"><small>'+strip.left+'</small><strong>'+strip.middle+'</strong><small>'+strip.right+'</small></span>';
      }))}</div>
      ${work.joined ? `<p class="instruction">红线指令 <b>${line}</b></p>
      <div class="wax-controls"><span>档案匣</span>${wax("box",["青匣","墨匣"],work.box)}<span>蜡印</span>${wax("seal",["甲","乙","丙"],work.seal)}</div>
      ${control("submit-wax","在匣扣上压封","green")}` : control("join","对合骑缝","green")}`);
}
function tallyDesk() {
  return clues("两道残账",
    `<div class="unfolded"><b>点收人留下的两份记录</b><p>一联按架点数，上架 9 包，下架 13 包。另一联按交接批次点数，早次 11 包，晚次 11 包。</p></div>
    <p>左上格还看得清。其余三格恢复后，横着和竖着都要对得上。</p>`) +
    sheet("点收台","补回分包数字",
     `<table class="ledger"><thead><tr><th>位置</th><th>早次</th><th>晚次</th><th>行和</th></tr></thead><tbody>
     <tr><th>上架</th><td class="inkcell">4</td><td>${numerical("inventory",1,work.inventory[1],"上架晚次")}</td><td>${work.inventory[0]+work.inventory[1]} / 9</td></tr>
     <tr><th>下架</th><td>${numerical("inventory",2,work.inventory[2],"下架早次")}</td><td>${numerical("inventory",3,work.inventory[3],"下架晚次")}</td><td>${work.inventory[2]+work.inventory[3]} / 13</td></tr>
     <tr><th>列和</th><td>${work.inventory[0]+work.inventory[2]} / 11</td><td>${work.inventory[1]+work.inventory[3]} / 11</td><td></td></tr></tbody></table>
     ${control("submit-tally","校验并封存留底","green")}`);
}
function dispatchDesk() {
  return clues("电报与对照表",
    `<div class="ticket wire-ticket"><small>电报封签 · 乙</small>山舟 · 河灯</div><p>从乙列查出每个字的替换符号。按电报顺序誊抄两个卷件。</p>
    <table class="ledger code-table"><thead><tr><th>暗记</th><th>乙</th><th>甲</th><th>丙</th></tr></thead><tbody>
      ${options(wireTable,row=>"<tr>"+row.map(value=>"<td>"+value+"</td>").join("")+"</tr>")}</tbody></table>`) +
    sheet("阅卷案","誊抄待调卷",
      `<div class="dispatch">${options(dispatch,(doc,i)=>`<section><b>${doc.code}</b><span>${doc.name}</span>
        ${control("copy","誊抄","simple",i,"copy-"+i)}</section>`)}</div>
      <div class="unfolded pouch"><strong>调阅袋 · ${work.copied.length} / 2</strong>
      <div>${work.copied.length ? options(work.copied,(id,i)=>control("uncopy",dispatch[id].code+"　取出","simple",i,"uncopy-"+i)) : "副本从左到右依次放入。"}</div></div>
      ${control("submit-dispatch","封调阅袋","green")}`);
}
function receiptDesk() {
  return clues("独立留底联",
    work.openedLedger ? `<p>一长杠五包，一短点一包。留底合计 22 包。</p><dl class="tally">
       ${options(loads,l=>`<div><dt>${l.tag}</dt><dd>${l.mark}</dd></div>`)}</dl>` :
      `<div class="folded-paper"><span>留　底</span></div>${control("ledger","翻开封存联","green")}`) +
    sheet("验收桌","接收联",
      `<div class="receipt"><div class="receipt-head"><span>匣签</span><span>实收包数</span></div>
      ${options(loads,(l,i)=>`<div class="receipt-row"><b>${l.tag}</b>${numerical("count",i,work.counts[i],l.tag)}</div>`)}
      <div class="receipt-row"><strong>合计</strong><strong>${work.counts.reduce((a,b)=>a+b,0)} 包</strong></div></div>
      ${control("submit-receipt","核对并盖章","green")}`);
}
const puzzleViews = [fileDesk, folioDesk, dialDesk, seamDesk, tallyDesk, dispatchDesk, receiptDesk];

function markPosition(target,index) {
  const old = target[index];
  target[index] = selected;
  selected = old;
  feedback = selected === null ? "" : "手中还有一张刚取出的纸件。";
}
function check(actual, expected) {
  return actual.length === expected.length && expected.every((n,i)=>actual[i]===n);
}
function checkStage(matches, failure) {
  if (matches) complete();
  else feedback = failure;
}
function adjust(values,string,max) {
  const [index,delta] = string.split(":").map(Number);
  values[index] = Math.min(max, Math.max(0,values[index]+delta));
  feedback="";
}

const puzzleActions = {
  peek(value) {
    const id=Number(value);
    selected=id;
    work.opened.push(id);
    feedback="";
  },
  bind(value) { markPosition(work.sent,Number(value)); },
  "submit-file"() { checkStage(check(work.sent,chronology),"收条暂不能绑定。先排除仍需经办的卷，再校对日期先后。"); },
  circle(value) {
    if (work.circles.has(value)) work.circles.delete(value);
    else work.circles.add(value);
    feedback="";
  },
  "clear-circles"() { work.circles.clear(); feedback=""; },
  "submit-folio"() {
    let missing=0, extra=0;
    proofLines.forEach(({original,copy},row)=>{
      [...original].forEach((char,col)=>{
        const marked=work.circles.has(row+":"+col);
        if (char!==copy[col] && !marked) missing++;
        if (char===copy[col] && marked) extra++;
      });
    });
    checkStage(!missing && !extra,`仍有 ${missing} 处漏圈、${extra} 处误圈。沿同一列对照两联。`);
  },
  dial(value) {
    const [i,delta]=value.split(":").map(Number);
    work.dials[i]=(work.dials[i]+delta+catalogue[i].items.length)%catalogue[i].items.length;
    feedback="";
  },
  "submit-dial"() {
    checkStage(catalogue.every((c,i)=>work.dials[i]===(c.reverse?c.items.length-c.code:c.code-1)),"柜屉打不开。确认三个数字对应的栏位，以及地区索引的阅读方向。");
  },
  seam(value) { if (!work.joined) {selected=Number(value); feedback="";} },
  glue(value) { if (!work.joined) markPosition(work.glued,Number(value)); },
  join() {
    work.joined=check(work.glued,chain);
    selected=null;
    feedback=work.joined?"红线接通了。照指令对匣子压封。":"骑缝断开了。确认首尾相符，并留出一片废抄纸。";
  },
  box(value) { work.box=value; feedback=""; },
  seal(value) { work.seal=value; feedback=""; },
  "submit-wax"() { checkStage(work.box==="墨匣"&&work.seal==="乙","暂未压印。指令里同时写了档案匣和蜡印。"); },
  inventory(value) { adjust(work.inventory,value,15); },
  "submit-tally"() { checkStage(check(work.inventory,inventoryTargets),"横点与竖点的数目还没对上，至少一联差了包数。"); },
  copy(value) {
    if (work.copied.length<2) {work.copied.push(Number(value)); feedback="";}
    else feedback="调阅袋已经有两份。取出不需要的那一份再誊抄。";
  },
  uncopy(value) { work.copied.splice(Number(value),1); feedback=""; },
  "submit-dispatch"() { checkStage(check(work.copied,dispatchTargets),"先别封袋。两份副本要对应电报的两对暗记，次序也要相同。"); },
  ledger() { work.openedLedger=true; feedback=""; },
  count(value) { adjust(work.counts,value,15); },
  "submit-receipt"() {
    const diff=loads.filter((load,i)=>load.sent!==work.counts[i]).length;
    if (!work.openedLedger) feedback="先翻开留底联，再逐匣核对。";
    else checkStage(diff===0,`收据暂不能盖章，还有 ${diff} 匣与留底不符。`);
  }
};
