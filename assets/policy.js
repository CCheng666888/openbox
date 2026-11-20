"use strict";

// 每个字段都单独提供可公开的概括值，禁止从原文切片拼出概括。
const ArchivePolicy = (() => {
  const fields = [
    {key: "title", label: "展件题名", full: "一张编目练习卡", short: "编目教学展件"},
    {key: "date", label: "制作日期", full: "2026 年 10 月 12 日", short: "2026 年"},
    {key: "condition", label: "纸张状况", full: "左下角折痕约 2 厘米，边缘有一处裂口", short: "纸张有损"},
    {key: "location", label: "存放位置", full: "模拟库房 B 区 · 04 架 · 02 格", short: "模拟库房 B 区"},
    {key: "batch", label: "入库批次", full: "DEMO-R17-042", short: "第 17 批"},
    {key: "contact", label: "经办代号", full: "演示员 · 白榆", short: "展务组"}
  ];

  // 0 移除、1 概括、2 原文。每个目标粒度同时是本次委托的必要值与披露上限。
  const cases = [
    {id: "visitor", number: "01", icon: "exhibit", title: "给观众做展签", role: "展览观众", label: "公开展签",
      teaser: "让观众读懂展件，也守住库房的边界。",
      brief: "观众只需知道展件的完整题名和制作年份。展签不展示保管、入库或经办资料。",
      levels: [2,1,0,0,0,0], why: [
        "展签要能指向具体展件，请保留完整题名。","观众只需要年份，具体月日超出展签需要。",
        "纸张修复情况属于保管记录。","观众参观展览不需要库房位置。","内部入库批次与展签无关。","展签不需要经办人员或部门信息。"]},
    {id: "repair", number: "02", icon: "repair", title: "给修复员派工", role: "修复员", label: "修复工单",
      teaser: "修复员需要知道纸张哪里受损。",
      brief: "交付台按完整题名发件。修复员要看到损伤的具体位置和程度，并知道向哪个组回报；取件由库房代办。",
      levels: [2,0,2,0,0,1], why: [
        "交付台按完整题名发件。","本次工单没有断代或年代鉴定任务。","修复员须知道破损的位置和程度。","库房代办取件，工单无需库位。","修复工序不要求入库批次。","回报给展务组即可，无需经办人的代号。"]},
    {id: "audit", number: "03", icon: "shelf", title: "给盘点员定位", role: "盘点员", label: "库位盘点",
      teaser: "让盘点员找对格位，核对指定批次。",
      brief: "这次抽查按完整入库批号和精确格位找件，只需核对展件类别。纸况、日期和经办资料由其他岗位处理。",
      levels: [1,0,0,2,2,0], why: [
        "盘点按批号查找，题名只需概括到类别。","本次盘点不使用制作日期。","纸况由修复岗位核对。","找件要精确到架和格。","整串批号用于区别同批次内的展件。","盘点工作表无需经办信息。"]}
  ];
  const modes = ["移除","概括","原文"];

  function review(task, choices) {
    return fields.map((field, i) => {
      const chosen = choices[i];
      const target = task.levels[i];
      if (![0, 1, 2].includes(chosen)) return {key: field.key, type: "未选择", reason: "请决定这一栏如何交付。"};
      if (chosen === target) return null;
      return {key: field.key, type: chosen > target ? "披露过多" : "信息不足", reason: task.why[i]};
    }).filter(Boolean);
  }

  function preview(choices) {
    return fields.flatMap((field, i) => {
      if (choices[i] === 2) return [[field.label, field.full]];
      if (choices[i] === 1) return [[field.label, field.short]];
      return [];
    });
  }

  function release(task, choices) {
    if (review(task, choices).length) throw new Error("交接方案需要复核。");
    const copy = {用途: "虚构教学样本", 接收方: task.role, 交接字段: Object.fromEntries(preview(choices))};
    return JSON.stringify(copy, null, 2) + "\n";
  }

  async function digest(content) {
    if (!globalThis.crypto?.subtle) throw new Error("当前浏览器未开放 Web Crypto。请用新版 Edge 或 Chrome 本地打开，或通过 localhost / HTTPS 访问。");
    const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
    const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
  }

  return {fields, cases, modes, review, preview, release, digest};
})();
