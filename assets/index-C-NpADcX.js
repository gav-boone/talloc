(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();const K={tags:"talloc_tags",transactions:"talloc_transactions",goals:"talloc_goals",budgets:"talloc_budgets"};function Tt(t){const e=localStorage.getItem(t);return e?JSON.parse(e):[]}function wt(t,e){localStorage.setItem(t,JSON.stringify(e))}function X(){return Tt(K.tags)}function Bt(t){wt(K.tags,t)}function Kt(t){const e=X();e.push(t),Bt(e)}function Zt(t){const e=X().map(n=>n.id===t.id?t:n);Bt(e)}function Qt(t){Bt(X().filter(e=>e.id!==t))}function pt(){return Tt(K.transactions)}function Ot(t){wt(K.transactions,t)}function te(t){const e=pt();e.push(t),Ot(e)}function ee(t){const e=pt().map(n=>n.id===t.id?t:n);Ot(e)}function ne(t){Ot(pt().filter(e=>e.id!==t))}function lt(){return Tt(K.goals)}function Ht(t){wt(K.goals,t)}function ae(t){const e=lt();e.push(t),Ht(e)}function xt(t){const e=lt().map(n=>n.id===t.id?t:n);Ht(e)}function se(t){Ht(lt().filter(e=>e.id!==t))}function vt(){return Tt(K.budgets)}function Ct(t){wt(K.budgets,t)}function oe(t){const e=vt();e.push(t),Ct(e)}function le(t){const e=vt().map(n=>n.id===t.id?t:n);Ct(e)}function ie(t){Ct(vt().filter(e=>e.id!==t))}function Mt(){return crypto.randomUUID()}function U(){return new Date().toISOString().slice(0,10)}function C(t){return`#${(t&16777215).toString(16).padStart(6,"0")}`}function j(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function p(t){const[e,n]=t.split(":").map(Number);return e*60+n}function it(t){if(t>=1440)return"24:00";const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function z(t){const[e,n]=t.split(":").map(Number);if(e===24)return"12:00am";const a=e>=12?"pm":"am";return`${e===0?12:e>12?e-12:e}:${String(n).padStart(2,"0")}${a}`}function J(t){if(t<=0)return"0m";const e=Math.floor(t/60),n=t%60;return e===0?`${n}m`:n===0?`${e}h`:`${e}h ${n}m`}const Wt=[4283215696,4280391411,4294198070,4294940672,4288423856,4278238420,4293467747,4287349578,4294961979,4282339765,4278228616,4294924066,4286141768,4284513675,4291681337,4284955319];function rt(t,e=new Set){const n=X();return n.length===0?"":`
    <div class="tag-selector-wrapper" id="${t}">
      <input type="text" class="tag-search" placeholder="Search tags..." aria-label="Search tags" />
      <div class="tag-selector-list">
        ${n.map(a=>`
          <button type="button" class="tag-toggle ${e.has(a.id)?"active":""}" data-tag-id="${a.id}" style="--tag-color:${C(a.colorValue)}">
            ${j(a.name)}
          </button>
        `).join("")}
      </div>
    </div>
  `}function ct(t,e,n){const a=t.querySelector(`#${e}`);if(!a)return n;const s=a.querySelector(".tag-search"),o=a.querySelectorAll(".tag-toggle");return s.addEventListener("input",()=>{const l=s.value.toLowerCase().trim();o.forEach(i=>{var c;const r=((c=i.textContent)==null?void 0:c.toLowerCase())||"";i.style.display=r.includes(l)?"":"none"})}),o.forEach(l=>{l.addEventListener("click",()=>{const i=l.dataset.tagId;n.has(i)?(n.delete(i),l.classList.remove("active")):(n.add(i),l.classList.add("active"))})}),n}let D=U(),L=null,R=null;function $t(t){const e=new Date(D+"T12:00:00");e.setDate(e.getDate()+t),D=e.toISOString().slice(0,10)}function _t(t){const e=new Date(t+"T12:00:00"),n=U(),a=(()=>{const s=new Date;return s.setDate(s.getDate()-1),s.toISOString().slice(0,10)})();return t===n?"Today":t===a?"Yesterday":e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}function re(t){return new Date(t+"T12:00:00").toLocaleDateString("en-US",{month:"long",year:"numeric"})}function ce(t,e){return new Date(t,e+1,0).getDate()}function de(t,e){const n=new Date(t,e,1).getDay();return n===0?6:n-1}function ue(t){const e=Math.floor(t/60);return e===0?"12 AM":e===12?"12 PM":e<12?`${e} AM`:`${e-12} PM`}function et(t){return pt().filter(e=>e.date===t).sort((e,n)=>p(e.endTime)-p(n.endTime))}function Yt(t){const e=et(t);return e.length===0?0:p(e[e.length-1].endTime)}function ge(t){L=null,t.innerHTML=`
    <section class="view-section log-view">
      <div class="day-nav">
        <button class="nav-arrow" id="prev-day" aria-label="Previous day">‹</button>
        <button class="day-nav-date" id="date-display">${_t(D)}</button>
        <button class="nav-arrow" id="next-day" aria-label="Next day">›</button>
      </div>
      <div id="date-picker-overlay" class="date-picker-overlay hidden">
        <div class="date-picker">
          <div class="picker-header">
            <button class="nav-arrow" id="picker-prev-month">‹</button>
            <span id="picker-month-label"></span>
            <button class="nav-arrow" id="picker-next-month">›</button>
          </div>
          <div class="picker-weekdays">
            <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
          </div>
          <div class="picker-grid" id="picker-grid"></div>
        </div>
      </div>
      <div id="day-content" class="day-content">
        ${Gt()}
      </div>
    </section>
  `,me(t),he(t),be(t),Xt(t)}function Gt(){const t=X(),e=new Map(t.map(u=>[u.id,u])),n=et(D),a=Yt(D),s=15,o=96,l=new Array(o).fill(null);let i=0;for(const u of n){const w=p(u.endTime),b=Math.floor(i/s),x=Math.floor(w/s);for(let M=b;M<x&&M<o;M++)l[M]=u;i=w}l.reduce((u,w,b)=>w?b:u,-1);const r=0,c=24,f=L!==null?`
    <div class="entry-form-overlay" id="entry-form-overlay">
      <div class="entry-form">
        <h3>Log: ${z(it(a))} → ${z(it(L))}</h3>
        <p class="entry-duration">${J(L-a)}</p>
        <div class="form-group">
          <input type="text" id="log-note" placeholder="Note (optional)" aria-label="Note" />
        </div>
        ${t.length>0?`
        <div class="form-group">
          ${rt("entry-tags",bt)}
        </div>
        `:""}
        <div class="entry-form-actions">
          <button class="btn btn-secondary" id="entry-cancel">Cancel</button>
          <button class="btn btn-primary" id="entry-confirm">Save</button>
        </div>
      </div>
    </div>
  `:"",k=R?et(D).find(u=>u.id===R):null,g=k?(()=>{const u=et(D).indexOf(k),w=et(D);let b="00:00";for(let x=0;x<u;x++)b=w[x].endTime;return`
      <div class="entry-form-overlay" id="edit-form-overlay">
        <div class="entry-form">
          <button class="btn-icon form-close" id="edit-cancel" aria-label="Close">×</button>
          <h3>Edit: ${z(b)} → ${z(k.endTime)}</h3>
          <p class="entry-duration">${J(p(k.endTime)-p(b))}</p>
          <div class="form-group">
            <input type="text" id="edit-note" placeholder="Note (optional)" aria-label="Note" value="${k.note?j(k.note):""}" />
          </div>
          ${t.length>0?`
          <div class="form-group">
            ${rt("edit-tags",new Set(k.tags))}
          </div>
          `:""}
          <div class="entry-form-actions">
            <button class="btn btn-danger" id="edit-delete">Delete</button>
            <button class="btn btn-primary" id="edit-save">Save</button>
          </div>
        </div>
      </div>
    `})():"",v=[];let h=null;for(let u=Math.floor(r*4);u<Math.floor(c*4);u++){const w=u*s,b=l[u],x=w>=a&&!b;h&&h.tx===b&&h.isAvailable===x?h.endSlot=u+1:(h&&v.push(h),h={tx:b,startSlot:u,endSlot:u+1,isAvailable:x})}h&&v.push(h);const d=Array.from({length:c-r},(u,w)=>{const b=r+w;return`<span class="cal-gutter" style="top:${w*4*28}px">${ue(b*60)}</span>`}).join(""),$=v.map(u=>{u.startSlot*s,u.endSlot*s;const w=(u.endSlot-u.startSlot)*28,b=u.tx,x=b?b.tags.map(M=>e.get(M)).find(Boolean):null;if(b&&x&&C(x.colorValue),b){const M=b.tags.map(q=>e.get(q)).filter(Boolean),W=M.map((q,nt)=>`<span class="cal-nail" style="background:${C(q.colorValue)};right:${nt*6}px"></span>`).join(""),_=M.map(q=>`<span class="cal-tag-chip" style="border-color:${C(q.colorValue)};color:${C(q.colorValue)}">${j(q.name)}</span>`).join("");return`
        <div class="cal-block filled" data-tx-id="${b.id}" style="height:${w}px">
          <div class="cal-content">
            ${b.note?`<span class="cal-note">${j(b.note)}</span>`:""}
            ${M.length>0?`<div class="cal-tags">${_}</div>`:""}
          </div>
          <div class="cal-nails">${W}</div>
        </div>
      `}else if(u.isAvailable){let M="";for(let W=u.startSlot;W<u.endSlot;W++){const _=W*s,q=L!==null&&_>=a&&_<L;M+=`<div class="cal-slot available${q?" pending":""}" data-slot-mins="${_}" style="height:28px"></div>`}return M}else return`<div class="cal-block empty" style="height:${w}px"></div>`}).join(""),y=new Date,S=y.getHours()*60+y.getMinutes(),F=D===U()?`<div class="cal-now-bar" style="top:${S/(24*60)*(96*28)}px"></div>`:"";return`
    <div class="time-grid" id="time-grid">
      <div class="cal-gutter-layer">${d}</div>
      <div class="cal-blocks-layer">${$}</div>
      ${F}
    </div>
  `+f+g}function B(t){const e=t.querySelector("#date-display");e.textContent=_t(D);const n=t.querySelector("#day-content");n.innerHTML=Gt(),Xt(t)}function Xt(t){fe(t),pe(t),ye(t),ve(t)}function fe(t){const e=t.querySelector("#time-grid");e&&e.querySelectorAll(".cal-slot.available").forEach(n=>{n.addEventListener("click",()=>{L=parseInt(n.dataset.slotMins)+15,B(t)})})}function pe(t){const e=t.querySelector("#time-grid");e&&e.querySelectorAll(".cal-block.filled").forEach(n=>{n.style.cursor="pointer",n.addEventListener("click",()=>{const a=n.dataset.txId;a&&(R=a,B(t))})})}function ve(t){const e=t.querySelector("#edit-form-overlay");if(!e)return;const n=et(D).find(s=>s.id===R);if(!n)return;const a=new Set(n.tags);ct(t,"edit-tags",a),t.querySelector("#edit-save").addEventListener("click",()=>{const s=t.querySelector("#edit-note").value||void 0,o=Array.from(a),l=et(D),i=l.findIndex(k=>k.id===n.id),r=i===0?0:p(l[i-1].endTime),c=p(n.endTime),f=Math.round((c-r)/15);if(o.length>f){alert(`Too many tags: ${o.length} tags for ${f} block${f>1?"s":""}. Max 1 tag per 15-min block.`);return}ee({...n,tags:o,note:s}),R=null,B(t)}),t.querySelector("#edit-cancel").addEventListener("click",()=>{R=null,B(t)}),t.querySelector("#edit-delete").addEventListener("click",()=>{n&&(ne(n.id),R=null,B(t))}),e.addEventListener("click",s=>{s.target===e&&(R=null,B(t))})}let bt=new Set;function ye(t){const e=t.querySelector("#entry-form-overlay");e&&(ct(t,"entry-tags",bt),t.querySelector("#entry-cancel").addEventListener("click",()=>{L=null,B(t)}),t.querySelector("#entry-confirm").addEventListener("click",()=>{if(L===null)return;const n=t.querySelector("#log-note").value||void 0,a=Yt(D),s=Math.round((L-a)/15),o=Array.from(bt);if(o.length>s){alert(`Too many tags: ${o.length} tags for ${s} block${s>1?"s":""}. Max 1 tag per 15-min block.`);return}const l={id:Mt(),date:D,endTime:it(L),tags:o,note:n};te(l),L=null,bt=new Set,B(t)}),e.addEventListener("click",n=>{n.target===e&&(L=null,B(t))}))}function me(t){t.querySelector("#prev-day").addEventListener("click",()=>{$t(-1),L=null,B(t)}),t.querySelector("#next-day").addEventListener("click",()=>{$t(1),L=null,B(t)})}function he(t){const e=t.querySelector("#day-content");let n=0,a=0,s=!1,o=null;e.addEventListener("touchstart",l=>{n=l.touches[0].clientX,a=l.touches[0].clientY,s=!0,o=null},{passive:!0}),e.addEventListener("touchmove",l=>{if(!s)return;const i=l.touches[0].clientX-n,r=l.touches[0].clientY-a;o===null&&(Math.abs(i)>10||Math.abs(r)>10)&&(o=Math.abs(i)>Math.abs(r)),o&&l.preventDefault()},{passive:!1}),e.addEventListener("touchend",l=>{if(!s)return;s=!1;const i=l.changedTouches[0].clientX,r=l.changedTouches[0].clientY,c=i-n,f=r-a;Math.abs(c)>60&&Math.abs(c)>Math.abs(f)*1.5&&(c<0?$t(1):$t(-1),L=null,B(t))},{passive:!0})}function be(t){const e=t.querySelector("#date-picker-overlay"),n=t.querySelector("#date-display");let a,s;function o(){const r=new Date(D+"T12:00:00");a=r.getMonth(),s=r.getFullYear(),i(),e.classList.remove("hidden")}function l(){e.classList.add("hidden")}function i(){const r=t.querySelector("#picker-month-label");r.textContent=re(`${s}-${String(a+1).padStart(2,"0")}-01`);const c=t.querySelector("#picker-grid"),f=ce(s,a),k=de(s,a);let g="";for(let v=0;v<k;v++)g+='<span class="picker-day empty"></span>';for(let v=1;v<=f;v++){const h=`${s}-${String(a+1).padStart(2,"0")}-${String(v).padStart(2,"0")}`,d=h===D,$=h===U(),y=["picker-day",d?"selected":"",$?"today":""].filter(Boolean).join(" ");g+=`<span class="${y}" data-date="${h}">${v}</span>`}c.innerHTML=g,c.querySelectorAll(".picker-day:not(.empty)").forEach(v=>{v.addEventListener("click",()=>{D=v.dataset.date,L=null,l(),B(t)})})}n.addEventListener("click",o),e.addEventListener("click",r=>{r.target===e&&l()}),t.querySelector("#picker-prev-month").addEventListener("click",()=>{a--,a<0&&(a=11,s--),i()}),t.querySelector("#picker-next-month").addEventListener("click",()=>{a++,a>11&&(a=0,s++),i()})}const Se=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],Q=15;let N=0,A=null,P=null,St=new Set;function kt(t){return vt().filter(e=>e.day===t).sort((e,n)=>p(e.endTime)-p(n.endTime))}function Ut(t){const e=kt(t);return e.length===0?0:p(e[e.length-1].endTime)}function $e(t){const e=Math.floor(t/60);return e===0?"12 AM":e===12?"12 PM":e<12?`${e} AM`:`${e-12} PM`}function V(t){const e=X(),n=new Map(e.map(d=>[d.id,d])),a=kt(N),s=Ut(N),o=96,l=new Array(o).fill(null);let i=0;for(const d of a){const $=p(d.endTime),y=Math.floor(i/Q),S=Math.floor($/Q);for(let T=y;T<S&&T<o;T++)l[T]=d;i=$}const r=[];let c=null;for(let d=0;d<o;d++){const $=d*Q,y=l[d],S=$>=s&&!y;c&&c.budget===y&&c.isAvailable===S?c.endSlot=d+1:(c&&r.push(c),c={budget:y,startSlot:d,endSlot:d+1,isAvailable:S})}c&&r.push(c);const f=Array.from({length:24},(d,$)=>`<span class="cal-gutter" style="top:${$*4*28}px">${$e($*60)}</span>`).join(""),k=r.map(d=>{d.startSlot*Q,d.endSlot*Q;const $=(d.endSlot-d.startSlot)*28,y=d.budget;if(y){const S=y.tags.map(E=>n.get(E)).filter(Boolean),T=S.map((E,u)=>`<span class="cal-nail" style="background:${C(E.colorValue)};right:${u*6}px"></span>`).join(""),F=S.map(E=>`<span class="cal-tag-chip" style="border-color:${C(E.colorValue)};color:${C(E.colorValue)}">${j(E.name)}</span>`).join("");return`
        <div class="cal-block filled" data-budget-id="${y.id}" style="height:${$}px">
          <div class="cal-content">
            ${y.note?`<span class="cal-note">${j(y.note)}</span>`:""}
            ${S.length>0?`<div class="cal-tags">${F}</div>`:""}
          </div>
          <div class="cal-nails">${T}</div>
        </div>
      `}else if(d.isAvailable){let S="";for(let T=d.startSlot;T<d.endSlot;T++){const F=T*Q,E=A!==null&&F>=s&&F<A;S+=`<div class="cal-slot available${E?" pending":""}" data-slot-mins="${F}" style="height:28px"></div>`}return S}else return`<div class="cal-block empty" style="height:${$}px"></div>`}).join(""),g=P?a.find(d=>d.id===P):null,v=g?(()=>{const d=a.indexOf(g);let $="00:00";for(let y=0;y<d;y++)$=a[y].endTime;return`
      <div class="entry-form-overlay" id="budget-edit-overlay">
        <div class="entry-form">
          <button class="btn-icon form-close" id="budget-edit-cancel" aria-label="Close">×</button>
          <h3>Edit: ${z($)} → ${z(g.endTime)}</h3>
          <p class="entry-duration">${J(p(g.endTime)-p($))}</p>
          <div class="form-group">
            <input type="text" id="budget-edit-note" placeholder="Note (optional)" value="${g.note?j(g.note):""}" />
          </div>
          ${e.length>0?`<div class="form-group">${rt("budget-edit-tags",new Set(g.tags))}</div>`:""}
          <div class="entry-form-actions">
            <button class="btn btn-danger" id="budget-edit-delete">Delete</button>
            <button class="btn btn-primary" id="budget-edit-save">Save</button>
          </div>
        </div>
      </div>
    `})():"",h=A!==null?`
    <div class="entry-form-overlay" id="budget-add-overlay">
      <div class="entry-form">
        <button class="btn-icon form-close" id="budget-add-cancel" aria-label="Close">×</button>
        <h3>Plan: ${z(it(s))} → ${z(it(A))}</h3>
        <p class="entry-duration">${J(A-s)}</p>
        <div class="form-group">
          <input type="text" id="budget-add-note" placeholder="Note (optional)" />
        </div>
        ${e.length>0?`<div class="form-group">${rt("budget-add-tags",St)}</div>`:""}
        <div class="entry-form-actions">
          <button class="btn btn-primary" id="budget-add-save">Save</button>
        </div>
      </div>
    </div>
  `:"";t.innerHTML=`
    <section class="view-section log-view">
      <div class="day-tabs">
        ${Se.map((d,$)=>`
          <button class="day-tab ${$===N?"active":""}" data-day="${$}">${d}</button>
        `).join("")}
      </div>
      <div id="budget-day-content" class="day-content">
        <div class="time-grid" id="budget-time-grid">
          <div class="cal-gutter-layer">${f}</div>
          <div class="cal-blocks-layer">${k}</div>
        </div>
        ${h}
        ${v}
      </div>
    </section>
  `,ke(t),Te(t),we(t),Me(t),De(t),Le(t)}function ke(t){t.querySelectorAll(".day-tab").forEach(e=>{e.addEventListener("click",()=>{N=parseInt(e.dataset.day),A=null,P=null,V(t)})})}function Te(t){const e=t.querySelector("#budget-day-content");if(!e)return;let n=0,a=0,s=!1,o=null;e.addEventListener("touchstart",l=>{n=l.touches[0].clientX,a=l.touches[0].clientY,s=!0,o=null},{passive:!0}),e.addEventListener("touchmove",l=>{if(!s)return;const i=l.touches[0].clientX-n,r=l.touches[0].clientY-a;o===null&&(Math.abs(i)>10||Math.abs(r)>10)&&(o=Math.abs(i)>Math.abs(r)),o&&l.preventDefault()},{passive:!1}),e.addEventListener("touchend",l=>{if(!s)return;s=!1;const i=l.changedTouches[0].clientX-n,r=l.changedTouches[0].clientY-a;Math.abs(i)>60&&Math.abs(i)>Math.abs(r)*1.5&&(i<0?N=(N+1)%7:N=(N+6)%7,A=null,P=null,V(t))},{passive:!0})}function we(t){const e=t.querySelector("#budget-time-grid");e&&e.querySelectorAll(".cal-slot.available").forEach(n=>{n.addEventListener("click",()=>{A=parseInt(n.dataset.slotMins)+Q,V(t)})})}function Me(t){const e=t.querySelector("#budget-time-grid");e&&e.querySelectorAll(".cal-block.filled").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.budgetId;a&&(P=a,V(t))})})}function De(t){const e=t.querySelector("#budget-add-overlay");e&&(ct(t,"budget-add-tags",St),t.querySelector("#budget-add-cancel").addEventListener("click",()=>{A=null,V(t)}),t.querySelector("#budget-add-save").addEventListener("click",()=>{if(A===null)return;const n=t.querySelector("#budget-add-note").value||void 0,a=Ut(N),s=Math.round((A-a)/15),o=Array.from(St);if(o.length>s){alert(`Too many tags: ${o.length} tags for ${s} block${s>1?"s":""}. Max 1 tag per 15-min block.`);return}const l={id:Mt(),day:N,endTime:it(A),tags:o,note:n};oe(l),A=null,St=new Set,V(t)}),e.addEventListener("click",n=>{n.target===e&&(A=null,V(t))}))}function Le(t){const e=t.querySelector("#budget-edit-overlay");if(!e)return;const n=kt(N).find(s=>s.id===P);if(!n)return;const a=ct(t,"budget-edit-tags",new Set(n.tags));t.querySelector("#budget-edit-cancel").addEventListener("click",()=>{P=null,V(t)}),t.querySelector("#budget-edit-save").addEventListener("click",()=>{const s=t.querySelector("#budget-edit-note").value||void 0,o=Array.from(a),l=kt(N),i=l.findIndex(k=>k.id===n.id),r=i===0?0:p(l[i-1].endTime),c=p(n.endTime),f=Math.round((c-r)/15);if(o.length>f){alert(`Too many tags: ${o.length} tags for ${f} block${f>1?"s":""}. Max 1 tag per 15-min block.`);return}le({...n,tags:o,note:s}),P=null,V(t)}),t.querySelector("#budget-edit-delete").addEventListener("click",()=>{ie(n.id),P=null,V(t)}),e.addEventListener("click",s=>{s.target===e&&(P=null,V(t))})}const yt=3;let st=null;function tt(t){const e=X(),n=lt(),a=n.filter(r=>r.period==="daily"),s=n.filter(r=>r.period==="weekly"),o=a.length<yt,l=s.length<yt,i=st?n.find(r=>r.id===st):null;t.innerHTML=`
    <section class="view-section">

      <div class="goals-section">
        <div class="goals-section-header">
          <h2>Daily</h2>
          <span class="goals-count">${a.length}/${yt}</span>
        </div>
        <ul class="goals-list">
          ${a.map(r=>Nt(r,e)).join("")}
        </ul>
        ${o?Vt("daily"):""}
      </div>

      <div class="goals-section">
        <div class="goals-section-header">
          <h2>Weekly</h2>
          <span class="goals-count">${s.length}/${yt}</span>
        </div>
        <ul class="goals-list">
          ${s.map(r=>Nt(r,e)).join("")}
        </ul>
        ${l?Vt("weekly"):""}
      </div>

      ${i?`
      <div class="entry-form-overlay" id="goal-tag-overlay">
        <div class="entry-form">
          <h3>Tags for: ${j(i.text)}</h3>
          <div class="form-group">
            ${rt("goal-edit-tags",new Set(i.tags))}
          </div>
          <div class="entry-form-actions">
            <button class="btn btn-primary" id="goal-tag-save">Done</button>
          </div>
        </div>
      </div>
      `:""}
    </section>
  `,xe(t)}function Nt(t,e){const n=new Map(e.map(s=>[s.id,s])),a=t.tags.map(s=>n.get(s)).filter(Boolean);return`
    <li class="goal-item-simple ${t.done?"done":""}">
      <button class="goal-check" data-id="${t.id}" aria-label="${t.done?"Mark undone":"Mark done"}">
        ${t.done?"✓":""}
      </button>
      <span class="goal-text">${j(t.text)}</span>
      <div class="goal-tags-area" data-id="${t.id}">
        ${a.length>0?`
          ${a.map(s=>`<span class="tag-chip-sm" style="background:${C(s.colorValue)}">${j(s.name)}</span>`).join("")}
        `:'<span class="goal-tag-hint">+ tag</span>'}
      </div>
      <button class="btn-icon btn-delete" data-id="${t.id}" aria-label="Delete goal">×</button>
    </li>
  `}function Vt(t,e){return`
    <form class="goal-add-form" data-period="${t}">
      <div class="goal-add-row">
        <input type="text" class="goal-text-input" placeholder="Add a goal..." required />
        <button type="submit" class="btn btn-primary btn-sm">+</button>
      </div>
      ${rt(`goal-tags-${t}`,new Set)}
    </form>
  `}function xe(t){t.querySelectorAll(".goal-check").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.id,o=lt().find(l=>l.id===a);o&&(xt({...o,done:!o.done}),tt(t))})}),t.querySelectorAll(".goals-list .btn-delete").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.id;se(a),tt(t)})}),t.querySelectorAll(".goal-add-form").forEach(n=>{const a=n,s=a.dataset.period,o=ct(t,`goal-tags-${s}`,new Set);n.addEventListener("submit",l=>{l.preventDefault();const r=a.querySelector(".goal-text-input").value.trim();if(!r)return;const c={id:Mt(),text:r,tags:Array.from(o),period:s,done:!1};ae(c),tt(t)})}),t.querySelectorAll(".goal-tags-area").forEach(n=>{n.addEventListener("click",()=>{st=n.dataset.id,tt(t)})});const e=t.querySelector("#goal-tag-overlay");if(e){const n=lt().find(a=>a.id===st);if(n){const a=ct(t,"goal-edit-tags",new Set(n.tags));t.querySelector("#goal-tag-save").addEventListener("click",()=>{xt({...n,tags:Array.from(a)}),st=null,tt(t)}),e.addEventListener("click",s=>{s.target===e&&(xt({...n,tags:Array.from(a)}),st=null,tt(t))})}}}let Y=U(),G=Rt(U()),H="day";function Rt(t){const e=new Date(t+"T12:00:00"),n=e.getDay(),a=e.getDate()-n+(n===0?-6:1);return e.setDate(a),e.toISOString().slice(0,10)}function Ee(t){const e=new Date(t+"T12:00:00").getDay();return e===0?6:e-1}function qe(t){const e=new Date(t+"T12:00:00"),n=U();return t===n?"Today":e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}function Ae(t){const e=new Date(t+"T12:00:00"),n=new Date(t+"T12:00:00");return n.setDate(n.getDate()+6),e.getMonth()===n.getMonth()?`${e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}–${n.getDate()}`:`${e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}–${n.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`}function mt(t){const e=new Date(Y+"T12:00:00");e.setDate(e.getDate()+t),Y=e.toISOString().slice(0,10)}function ht(t){const e=new Date(G+"T12:00:00");e.setDate(e.getDate()+t*7),G=e.toISOString().slice(0,10)}function Ie(t){const e=[];for(let n=0;n<7;n++){const a=new Date(t+"T12:00:00");a.setDate(a.getDate()+n),e.push(a.toISOString().slice(0,10))}return e}function ut(t){const e=[...t].sort((s,o)=>p(s.endTime)-p(o.endTime)),n=new Map;let a="00:00";for(const s of e){const o=p(s.endTime)-p(a);if(o>0&&s.tags.length>0){const l=Math.round(o/15),i=Math.floor(l/s.tags.length),r=l-i*s.tags.length;for(let c=0;c<s.tags.length;c++){const f=i+(c<r?1:0);n.set(s.tags[c],(n.get(s.tags[c])||0)+f*15)}}a=s.endTime}return n}function jt(t){if(t.length===0)return 0;const e=[...t].sort((n,a)=>p(n.endTime)-p(a.endTime));return p(e[e.length-1].endTime)}function ot(t){const e=X(),n=vt(),a=pt(),s=new Map(e.map(m=>[m.id,m])),o=U(),l=new Date,i=Math.floor((l.getHours()*60+l.getMinutes())/15)*15,r=Ee(Y),c=a.filter(m=>m.date===Y),f=ut(c);jt(c);const k=Y===o,g=n.filter(m=>m.day===r),v=k?g.filter(m=>p(m.endTime)<=i):g,h=ut(v),d=[...v].sort((m,O)=>p(m.endTime)-p(O.endTime));d.length>0&&p(d[d.length-1].endTime);const $=ut(g),y=new Set([...f.keys(),...h.keys(),...$.keys()]),S=Ie(G),T=Rt(o),F=G===T;let E=0,u=0;const w=new Map,b=new Map;for(let m=0;m<7;m++){const O=S[m],Z=a.filter(I=>I.date===O);E+=jt(Z);const zt=ut(Z);for(const[I,dt]of zt)w.set(I,(w.get(I)||0)+dt);const Dt=n.filter(I=>I.day===m);let at;F?O<o?at=Dt:O===o?at=Dt.filter(I=>p(I.endTime)<=i):at=[]:at=Dt;const Jt=ut(at);for(const[I,dt]of Jt)b.set(I,(b.get(I)||0)+dt);const Lt=[...at].sort((I,dt)=>p(I.endTime)-p(dt.endTime));Lt.length>0&&(u+=p(Lt[Lt.length-1].endTime))}const x=new Set([...w.keys(),...b.keys()]);t.innerHTML=`
    <section class="view-section">
      <div class="day-tabs">
        <button class="day-tab ${H==="day"?"active":""}" data-mode="day">Day</button>
        <button class="day-tab ${H==="week"?"active":""}" data-mode="week">Week</button>
      </div>

      ${H==="day"?`
      <div class="balance-nav">
        <button class="nav-arrow" id="bal-prev">‹</button>
        <button class="balance-nav-label" id="bal-date-btn">${qe(Y)}</button>
        <button class="nav-arrow" id="bal-next">›</button>
      </div>
      <div id="bal-picker-overlay" class="date-picker-overlay hidden">
        <div class="date-picker">
          <div class="picker-header">
            <button class="nav-arrow" id="bal-picker-prev">‹</button>
            <span id="bal-picker-month"></span>
            <button class="nav-arrow" id="bal-picker-next">›</button>
          </div>
          <div class="picker-weekdays"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>
          <div class="picker-grid" id="bal-picker-grid"></div>
        </div>
      </div>
      ${y.size>0?`
      <ul class="balance-list">
        ${Ft(y,h,f,s)}
      </ul>
      `:'<p class="hint">No data for this day.</p>'}
      `:`
      <div class="balance-nav">
        <button class="nav-arrow" id="bal-prev">‹</button>
        <button class="balance-nav-label" id="bal-date-btn">${Ae(G)}</button>
        <button class="nav-arrow" id="bal-next">›</button>
      </div>
      <div id="bal-picker-overlay" class="date-picker-overlay hidden">
        <div class="date-picker">
          <div class="picker-header">
            <button class="nav-arrow" id="bal-picker-prev">‹</button>
            <span id="bal-picker-month"></span>
            <button class="nav-arrow" id="bal-picker-next">›</button>
          </div>
          <div class="picker-weekdays"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>
          <div class="picker-grid" id="bal-picker-grid"></div>
        </div>
      </div>
      ${x.size>0?`
      <ul class="balance-list">
        ${Ft(x,b,w,s)}
      </ul>
      `:'<p class="hint">No data for this week.</p>'}
      `}
    </section>
  `,t.querySelectorAll(".day-tab").forEach(m=>{m.addEventListener("click",()=>{H=m.dataset.mode,ot(t)})}),t.querySelector("#bal-prev").addEventListener("click",()=>{H==="day"?mt(-1):ht(-1),ot(t)}),t.querySelector("#bal-next").addEventListener("click",()=>{H==="day"?mt(1):ht(1),ot(t)}),Be(t);const M=t.querySelector(".view-section");let W=0,_=0,q=!1,nt=null;M.addEventListener("touchstart",m=>{W=m.touches[0].clientX,_=m.touches[0].clientY,q=!0,nt=null},{passive:!0}),M.addEventListener("touchmove",m=>{if(!q)return;const O=m.touches[0].clientX-W,Z=m.touches[0].clientY-_;nt===null&&(Math.abs(O)>10||Math.abs(Z)>10)&&(nt=Math.abs(O)>Math.abs(Z)),nt&&m.preventDefault()},{passive:!1}),M.addEventListener("touchend",m=>{if(!q)return;q=!1;const O=m.changedTouches[0].clientX-W,Z=m.changedTouches[0].clientY-_;Math.abs(O)>60&&Math.abs(O)>Math.abs(Z)*1.5&&(O<0?H==="day"?mt(1):ht(1):H==="day"?mt(-1):ht(-1),ot(t))},{passive:!0})}function Be(t){const e=t.querySelector("#bal-picker-overlay"),n=t.querySelector("#bal-date-btn");if(!e||!n)return;let a,s;function o(){return H==="day"?new Date(Y+"T12:00:00"):new Date(G+"T12:00:00")}function l(){const g=o();a=g.getMonth(),s=g.getFullYear(),k(),e.classList.remove("hidden")}function i(){e.classList.add("hidden")}function r(g,v){return new Date(g,v+1,0).getDate()}function c(g,v){const h=new Date(g,v,1).getDay();return h===0?6:h-1}function f(g){const v=new Date(g+"T12:00:00"),h=v.getDay(),d=v.getDate()-h+(h===0?-6:1);return v.setDate(d),v.toISOString().slice(0,10)}function k(){const g=t.querySelector("#bal-picker-month"),v=["January","February","March","April","May","June","July","August","September","October","November","December"];g.textContent=`${v[a]} ${s}`;const h=t.querySelector("#bal-picker-grid"),d=r(s,a),$=c(s,a);let y="";for(let S=0;S<$;S++)y+='<span class="picker-day empty"></span>';for(let S=1;S<=d;S++){const T=`${s}-${String(a+1).padStart(2,"0")}-${String(S).padStart(2,"0")}`,F=H==="day"?T===Y:f(T)===G,E=T===U(),u=H==="week"&&f(T)===G,w=["picker-day",F?"selected":"",E?"today":"",u?"week-highlight":""].filter(Boolean).join(" ");y+=`<span class="${w}" data-date="${T}">${S}</span>`}h.innerHTML=y,h.querySelectorAll(".picker-day:not(.empty)").forEach(S=>{S.addEventListener("click",()=>{const T=S.dataset.date;H==="day"?Y=T:G=f(T),i(),ot(t)})})}n.addEventListener("click",l),e.addEventListener("click",g=>{g.target===e&&i()}),t.querySelector("#bal-picker-prev").addEventListener("click",()=>{a--,a<0&&(a=11,s--),k()}),t.querySelector("#bal-picker-next").addEventListener("click",()=>{a++,a>11&&(a=0,s++),k()})}function Ft(t,e,n,a){return Array.from(t).map(s=>{const o=a.get(s),l=o?C(o.colorValue):"#888",i=o?j(o.name):"Unknown",r=e.get(s)||0,c=n.get(s)||0,f=c-r,k=f>0?"over":f<0?"under":"even",g=f===0?"On track":f>0?`+${J(f)} over`:`${J(Math.abs(f))} under`;return`
      <li class="balance-item">
        <span class="cat-dot" style="background:${l}"></span>
        <span class="balance-name">${i}</span>
        <span class="balance-budgeted">${J(r)}</span>
        <span class="balance-actual">${J(c)}</span>
        <span class="balance-diff ${k}">${g}</span>
      </li>
    `}).join("")}let Et=Wt[0];function gt(t){const e=X();t.innerHTML=`
    <section class="view-section">
      
      <h2>Tags</h2>
      <p class="subtitle">Manage your tags for categorizing time entries.</p>
      <form id="tag-form" class="form-card">
        <div class="form-group">
          <input type="text" id="tag-name" placeholder="New tag name..." required />
        </div>
        <div class="form-group">
          <div class="color-palette" id="color-palette">
            ${Wt.map(a=>`
              <button type="button" class="color-swatch ${a===Et?"active":""}" data-color="${a}" style="background:${C(a)}" aria-label="Select color"></button>
            `).join("")}
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Tag</button>
      </form>
      <ul id="tag-list" class="tag-list">
        ${e.map(a=>`
          <li class="tag-item" data-id="${a.id}">
            <span class="tag-chip" style="background:${C(a.colorValue)}">${j(a.name)}</span>
            <div class="tag-actions">
              <button class="btn-icon btn-edit" data-id="${a.id}" aria-label="Edit tag">✎</button>
              <button class="btn-icon btn-delete" data-id="${a.id}" aria-label="Delete tag">×</button>
            </div>
          </li>
        `).join("")}
      </ul>
      ${e.length===0?'<p class="hint">No tags yet. Add some above to organize your time entries.</p>':""}

      <h2>Data</h2>
      <div class="form-card">
        <div class="form-group">
          <label for="export-email">Email export to</label>
          <input type="email" id="export-email" placeholder="your@email.com" />
        </div>
        <button id="export-btn" class="btn btn-secondary">Send Export</button>
        <button id="clear-btn" class="btn btn-danger" style="margin-top:8px">Clear All Data</button>
      </div>
    </section>
  `,t.querySelectorAll(".color-swatch").forEach(a=>{a.addEventListener("click",()=>{Et=parseInt(a.dataset.color),t.querySelectorAll(".color-swatch").forEach(s=>s.classList.remove("active")),a.classList.add("active")})}),t.querySelector("#tag-form").addEventListener("submit",a=>{a.preventDefault();const s=document.getElementById("tag-name").value.trim();if(!s)return;const o={id:Mt(),name:s,colorValue:Et};Kt(o),gt(t)}),t.querySelectorAll(".btn-delete").forEach(a=>{a.addEventListener("click",()=>{const s=a.dataset.id;confirm("Delete this tag?")&&(Qt(s),gt(t))})}),t.querySelectorAll(".btn-edit").forEach(a=>{a.addEventListener("click",()=>{const s=a.dataset.id,o=e.find(i=>i.id===s);if(!o)return;const l=prompt("Rename tag:",o.name);l&&l.trim()&&(Zt({...o,name:l.trim()}),gt(t))})}),t.querySelector("#export-btn").addEventListener("click",()=>{const a=t.querySelector("#export-email"),s=a.value.trim();if(!s||!a.validity.valid){a.reportValidity();return}const o={tags:localStorage.getItem("talloc_tags"),transactions:localStorage.getItem("talloc_transactions"),goals:localStorage.getItem("talloc_goals"),budgets:localStorage.getItem("talloc_budgets")},l=JSON.stringify(o,null,2),i=`Talloc Export — ${new Date().toISOString().slice(0,10)}`;if(navigator.share&&navigator.canShare){const r=new File([l],`talloc-export-${new Date().toISOString().slice(0,10)}.json`,{type:"application/json"}),c={title:i,files:[r]};if(navigator.canShare(c)){navigator.share(c).catch(()=>{Pt(s,i,l)});return}}Pt(s,i,l)}),t.querySelector("#clear-btn").addEventListener("click",()=>{confirm("This will delete ALL your data. Are you sure?")&&(localStorage.removeItem("talloc_tags"),localStorage.removeItem("talloc_transactions"),localStorage.removeItem("talloc_goals"),localStorage.removeItem("talloc_budgets"),gt(t))})}function Pt(t,e,n){const s=n.length>1500?n.slice(0,1500)+`
...(truncated, use Share for full data)`:n,o=`mailto:${encodeURIComponent(t)}?subject=${encodeURIComponent(e)}&body=${encodeURIComponent(s)}`;window.location.href=o}function Oe(){window.visualViewport&&(window.visualViewport.addEventListener("resize",Ce),window.visualViewport.addEventListener("scroll",Ne),document.addEventListener("focusin",t=>{const e=t.target;He(e)&&(setTimeout(ft,100),setTimeout(ft,300),setTimeout(ft,500))}))}function He(t){const e=t.tagName.toLowerCase();return e==="input"||e==="textarea"||e==="select"}function Ce(){ft()}function Ne(){ft()}function ft(){const t=window.visualViewport;if(!t)return;document.querySelectorAll(".entry-form-overlay, .date-picker-overlay:not(.hidden)").forEach(n=>{const a=n;a.style.position="fixed",a.style.top=`${t.offsetTop}px`,a.style.left=`${t.offsetLeft}px`,a.style.width=`${t.width}px`,a.style.height=`${t.height}px`})}const At={log:ge,budgets:V,goals:tt,balance:ot,settings:gt};let It="log";function qt(t){It=t;const e=document.getElementById("view-container");document.querySelectorAll(".nav-btn").forEach(n=>{n.classList.toggle("active",n.dataset.view===t)}),At[t](e),window.location.hash=t}function Ve(){const t=window.location.hash.slice(1);t&&t in At&&(It=t),document.querySelectorAll(".nav-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.view;qt(n)})}),window.addEventListener("hashchange",()=>{const e=window.location.hash.slice(1);e&&e in At&&qt(e)}),qt(It)}"serviceWorker"in navigator&&navigator.serviceWorker.register("/talloc/sw.js").catch(()=>{});Oe();Ve();
