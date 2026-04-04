import{C as e,g as t}from"./src-DNd1jfj7-C1Qd2hpA-BUNexY1v.js";import{E as n,R as r,S as i,V as a,_ as o,a as s,b as c,l,rt as u,s as d}from"./chunk-7R4GIKGN-CJNsPTkK-BUGO3MC9-CgNuHYlc.js";import{Dt as f,st as p,t as m}from"./chunk-GEFDOKGD-BSKyS7pq-BmdKvrZN-DnlXf_Ks.js";import{d as h,r as g,w as _}from"./index-BP-TWUtJ.js";import"./_baseUniq-MpDXTHgb-D3BcQAxB-BoC3pEKM.js";import"./_basePickBy-cdwJHl7Q-DSSofWF--DJKKyfSF.js";import"./clone-BRiPGH1F-D0jXoRNk-Cj1cCWT1.js";import"./chunk-XZSTWKYB-CDIROrP_-CUW8cobT-aLEwUX6e.js";import"./chunk-R5LLSJPH-CzlHPIVa-BR1MgoBI-D8EUM-aT.js";import"./chunk-7E7YKBS2-CNqTo76n-DM_Dx5AS-DLOn7nLS.js";import"./chunk-EGIJ26TM-BqiB6d8N-DssmHc6P-2_gpUw3s.js";import"./chunk-C72U2L5F-CEGK7iDR-DTsauvTR-0x8sE0CN.js";import"./chunk-XIRO2GV7-CZIrWOIn-CrdZhANu-r5ibPkWw.js";import"./chunk-L3YUKLVL-C_7d9w4O-CZo-VJAN-ciP0Fy0o.js";import"./chunk-OZEHJAEY-DH0xgbTp-WEFPaMI7-D99NkNiy.js";import{t as v}from"./chunk-4BX2VUAB-Vik3L4HH-oiYpGHOe-ppMcH5SO.js";import{t as y}from"./mermaid-parser.core-BifaC-eL-YkTzF0sc-PKUVg3cV.js";import{t as b}from"./ordinal-BDTCIhXR-B2kHUhGQ-ZoFb-bzW.js";import{t as x}from"./arc-BSbHJ8P9-BlZkQV6S-B-gh-Geg.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,r=h(0),i=h(f),a=h(0);function o(o){var s,c=(o=_(o)).length,l,u,d=0,p=Array(c),m=Array(c),h=+r.apply(this,arguments),g=Math.min(f,Math.max(-f,i.apply(this,arguments)-h)),v,y=Math.min(Math.abs(g)/c,a.apply(this,arguments)),b=y*(g<0?-1:1),x;for(s=0;s<c;++s)(x=m[p[s]=s]=+e(o[s],s,o))>0&&(d+=x);for(t==null?n!=null&&p.sort(function(e,t){return n(o[e],o[t])}):p.sort(function(e,n){return t(m[e],m[n])}),s=0,u=d?(g-c*b)/d:0;s<c;++s,h=v)l=p[s],x=m[l],v=h+(x>0?x*u:0)+b,m[l]={data:o[l],index:s,value:x,startAngle:h,endAngle:v,padAngle:y};return m}return o.value=function(t){return arguments.length?(e=typeof t==`function`?t:h(+t),o):e},o.sortValues=function(e){return arguments.length?(t=e,n=null,o):t},o.sort=function(e){return arguments.length?(n=e,t=null,o):n},o.startAngle=function(e){return arguments.length?(r=typeof e==`function`?e:h(+e),o):r},o.endAngle=function(e){return arguments.length?(i=typeof e==`function`?e:h(+e),o):i},o.padAngle=function(e){return arguments.length?(a=typeof e==`function`?e:h(+e),o):a},o}var T=o.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:t(()=>structuredClone(k),`getConfig`),clear:t(()=>{D=new Map,O=E.showData,s()},`clear`),setDiagramTitle:i,getDiagramTitle:a,setAccTitle:u,getAccTitle:n,setAccDescription:l,getAccDescription:d,addSection:t(({label:t,value:n})=>{if(n<0)throw Error(`"${t}" has invalid value: ${n}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(t)||(D.set(t,n),e.debug(`added new section: ${t}, with value: ${n}`))},`addSection`),getSections:t(()=>D,`getSections`),setShowData:t(e=>{O=e},`setShowData`),getShowData:t(()=>O,`getShowData`)},j=t((e,t)=>{v(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:t(async t=>{let n=await y(`pie`,t);e.debug(n),j(n,A)},`parse`)},N=t(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),P=t(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1).sort((e,t)=>t.value-e.value);return w().value(e=>e.value)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:t((t,n,i,a)=>{e.debug(`rendering pie chart
`+t);let o=a.db,s=c(),l=p(o.getConfig(),s.pie),u=g(n),d=u.append(`g`);d.attr(`transform`,`translate(225,225)`);let{themeVariables:f}=s,[h]=m(f.pieOuterStrokeWidth);h??=2;let _=l.textPosition,v=x().innerRadius(0).outerRadius(185),y=x().innerRadius(185*_).outerRadius(185*_);d.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+h/2).attr(`class`,`pieOuterCircle`);let S=o.getSections(),C=P(S),w=[f.pie1,f.pie2,f.pie3,f.pie4,f.pie5,f.pie6,f.pie7,f.pie8,f.pie9,f.pie10,f.pie11,f.pie12],T=0;S.forEach(e=>{T+=e});let E=C.filter(e=>(e.data.value/T*100).toFixed(0)!==`0`),D=b(w);d.selectAll(`mySlices`).data(E).enter().append(`path`).attr(`d`,v).attr(`fill`,e=>D(e.data.label)).attr(`class`,`pieCircle`),d.selectAll(`mySlices`).data(E).enter().append(`text`).text(e=>(e.data.value/T*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+y.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`),d.append(`text`).text(o.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`);let O=[...S.entries()].map(([e,t])=>({label:e,value:t})),k=d.selectAll(`.legend`).data(O).enter().append(`g`).attr(`class`,`legend`).attr(`transform`,(e,t)=>{let n=22*O.length/2;return`translate(216,`+(t*22-n)+`)`});k.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>D(e.label)).style(`stroke`,e=>D(e.label)),k.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let A=512+Math.max(...k.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0));u.attr(`viewBox`,`0 0 ${A} 450`),r(u,450,A,l.useMaxWidth)},`draw`)},styles:N};export{F as diagram};