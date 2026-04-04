import{c as e,l as t}from"./src-DNd1jfj7-C1Qd2hpA.js";import{$ as n,C as r,M as i,R as a,T as o,i as s,it as c,j as l,tt as u,y as d}from"./chunk-7R4GIKGN-CJNsPTkK-BUGO3MC9.js";import{f}from"./math-BKVz7c5F-ydYsXxWa.js";import"./dist-CfXmrz1P-CvhIdfPo.js";import{h as p,p as m}from"./chunk-GEFDOKGD-BSKyS7pq-BmdKvrZN.js";import{_ as h,g,l as _}from"./index-D_7QM_Ez.js";import"./_baseUniq-MpDXTHgb-D3BcQAxB.js";import"./_basePickBy-cdwJHl7Q-DSSofWF-.js";import"./clone-BRiPGH1F-D0jXoRNk.js";import"./chunk-XZSTWKYB-CDIROrP_-CUW8cobT.js";import"./chunk-R5LLSJPH-CzlHPIVa-BR1MgoBI.js";import"./chunk-7E7YKBS2-CNqTo76n-DM_Dx5AS.js";import"./chunk-EGIJ26TM-BqiB6d8N-DssmHc6P.js";import"./chunk-C72U2L5F-CEGK7iDR-DTsauvTR.js";import"./chunk-XIRO2GV7-CZIrWOIn-CrdZhANu.js";import"./chunk-L3YUKLVL-C_7d9w4O-CZo-VJAN.js";import"./chunk-OZEHJAEY-DH0xgbTp-WEFPaMI7.js";import{t as v}from"./chunk-4BX2VUAB-Vik3L4HH-oiYpGHOe.js";import{t as y}from"./mermaid-parser.core-BifaC-eL-YkTzF0sc.js";import{t as b}from"./ordinal-BDTCIhXR-B2kHUhGQ.js";import{t as x}from"./arc-BSbHJ8P9-BlZkQV6S.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,r=h(0),i=h(f),a=h(0);function o(o){var s,c=(o=g(o)).length,l,u,d=0,p=Array(c),m=Array(c),h=+r.apply(this,arguments),_=Math.min(f,Math.max(-f,i.apply(this,arguments)-h)),v,y=Math.min(Math.abs(_)/c,a.apply(this,arguments)),b=y*(_<0?-1:1),x;for(s=0;s<c;++s)(x=m[p[s]=s]=+e(o[s],s,o))>0&&(d+=x);for(t==null?n!=null&&p.sort(function(e,t){return n(o[e],o[t])}):p.sort(function(e,n){return t(m[e],m[n])}),s=0,u=d?(_-c*b)/d:0;s<c;++s,h=v)l=p[s],x=m[l],v=h+(x>0?x*u:0)+b,m[l]={data:o[l],index:s,value:x,startAngle:h,endAngle:v,padAngle:y};return m}return o.value=function(t){return arguments.length?(e=typeof t==`function`?t:h(+t),o):e},o.sortValues=function(e){return arguments.length?(t=e,n=null,o):t},o.sort=function(e){return arguments.length?(n=e,t=null,o):n},o.startAngle=function(e){return arguments.length?(r=typeof e==`function`?e:h(+e),o):r},o.endAngle=function(e){return arguments.length?(i=typeof e==`function`?e:h(+e),o):i},o.padAngle=function(e){return arguments.length?(a=typeof e==`function`?e:h(+e),o):a},o}var T=a.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:e(()=>structuredClone(k),`getConfig`),clear:e(()=>{D=new Map,O=E.showData,c()},`clear`),setDiagramTitle:n,getDiagramTitle:o,setAccTitle:l,getAccTitle:u,setAccDescription:r,getAccDescription:s,addSection:e(({label:e,value:n})=>{if(n<0)throw Error(`"${e}" has invalid value: ${n}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,n),t.debug(`added new section: ${e}, with value: ${n}`))},`addSection`),getSections:e(()=>D,`getSections`),setShowData:e(e=>{O=e},`setShowData`),getShowData:e(()=>O,`getShowData`)},j=e((e,t)=>{v(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:e(async e=>{let n=await y(`pie`,e);t.debug(n),j(n,A)},`parse`)},N=e(e=>`
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
`,`getStyles`),P=e(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1).sort((e,t)=>t.value-e.value);return w().value(e=>e.value)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:e((e,n,r,a)=>{t.debug(`rendering pie chart
`+e);let o=a.db,s=d(),c=m(o.getConfig(),s.pie),l=_(n),u=l.append(`g`);u.attr(`transform`,`translate(225,225)`);let{themeVariables:f}=s,[h]=p(f.pieOuterStrokeWidth);h??=2;let g=c.textPosition,v=x().innerRadius(0).outerRadius(185),y=x().innerRadius(185*g).outerRadius(185*g);u.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+h/2).attr(`class`,`pieOuterCircle`);let S=o.getSections(),C=P(S),w=[f.pie1,f.pie2,f.pie3,f.pie4,f.pie5,f.pie6,f.pie7,f.pie8,f.pie9,f.pie10,f.pie11,f.pie12],T=0;S.forEach(e=>{T+=e});let E=C.filter(e=>(e.data.value/T*100).toFixed(0)!==`0`),D=b(w);u.selectAll(`mySlices`).data(E).enter().append(`path`).attr(`d`,v).attr(`fill`,e=>D(e.data.label)).attr(`class`,`pieCircle`),u.selectAll(`mySlices`).data(E).enter().append(`text`).text(e=>(e.data.value/T*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+y.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`),u.append(`text`).text(o.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`);let O=[...S.entries()].map(([e,t])=>({label:e,value:t})),k=u.selectAll(`.legend`).data(O).enter().append(`g`).attr(`class`,`legend`).attr(`transform`,(e,t)=>{let n=22*O.length/2;return`translate(216,`+(t*22-n)+`)`});k.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>D(e.label)).style(`stroke`,e=>D(e.label)),k.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let A=512+Math.max(...k.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0));l.attr(`viewBox`,`0 0 ${A} 450`),i(l,450,A,c.useMaxWidth)},`draw`)},styles:N};export{F as diagram};