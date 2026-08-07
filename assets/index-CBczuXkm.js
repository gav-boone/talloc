(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();const K={tags:"talloc_tags",transactions:"talloc_transactions",goals:"talloc_goals",budgets:"talloc_budgets"};function kt(t){const e=localStorage.getItem(t);return e?JSON.parse(e):[]}function Tt(t,e){localStorage.setItem(t,JSON.stringify(e))}function X(){return kt(K.tags)}function At(t){Tt(K.tags,t)}function Jt(t){const e=X();e.push(t),At(e)}function Kt(t){const e=X().map(n=>n.id===t.id?t:n);At(e)}function Zt(t){At(X().filter(e=>e.id!==t))}function ft(){return kt(K.transactions)}function Bt(t){Tt(K.transactions,t)}function Qt(t){const e=ft();e.push(t),Bt(e)}function te(t){const e=ft().map(n=>n.id===t.id?t:n);Bt(e)}function ee(t){Bt(ft().filter(e=>e.id!==t))}function lt(){return kt(K.goals)}function Ot(t){Tt(K.goals,t)}function ne(t){const e=lt();e.push(t),Ot(e)}function Lt(t){const e=lt().map(n=>n.id===t.id?t:n);Ot(e)}function ae(t){Ot(lt().filter(e=>e.id!==t))}function pt(){return kt(K.budgets)}function Ht(t){Tt(K.budgets,t)}function se(t){const e=pt();e.push(t),Ht(e)}function oe(t){const e=pt().map(n=>n.id===t.id?t:n);Ht(e)}function le(t){Ht(pt().filter(e=>e.id!==t))}function Mt(){return crypto.randomUUID()}function U(){return new Date().toISOString().slice(0,10)}function C(t){return`#${(t&16777215).toString(16).padStart(6,"0")}`}function F(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function p(t){const[e,n]=t.split(":").map(Number);return e*60+n}function it(t){if(t>=1440)return"24:00";const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function z(t){const[e,n]=t.split(":").map(Number);if(e===24)return"12:00am";const a=e>=12?"pm":"am";return`${e===0?12:e>12?e-12:e}:${String(n).padStart(2,"0")}${a}`}function J(t){if(t<=0)return"0m";const e=Math.floor(t/60),n=t%60;return e===0?`${n}m`:n===0?`${e}h`:`${e}h ${n}m`}const Wt=[4283215696,4280391411,4294198070,4294940672,4288423856,4278238420,4293467747,4287349578,4294961979,4282339765,4278228616,4294924066,4286141768,4284513675,4291681337,4284955319];function rt(t,e=new Set){const n=X();return n.length===0?"":`
    <div class="tag-selector-wrapper" id="${t}">
      <input type="text" class="tag-search" placeholder="Search tags..." aria-label="Search tags" />
      <div class="tag-selector-list">
        ${n.map(a=>`
          <button type="button" class="tag-toggle ${e.has(a.id)?"active":""}" data-tag-id="${a.id}" style="--tag-color:${C(a.colorValue)}">
            ${F(a.name)}
          </button>
        `).join("")}
      </div>
    </div>
  `}function ct(t,e,n){const a=t.querySelector(`#${e}`);if(!a)return n;const s=a.querySelector(".tag-search"),o=a.querySelectorAll(".tag-toggle");return s.addEventListener("input",()=>{const l=s.value.toLowerCase().trim();o.forEach(i=>{var c;const r=((c=i.textContent)==null?void 0:c.toLowerCase())||"";i.style.display=r.includes(l)?"":"none"})}),o.forEach(l=>{l.addEventListener("click",()=>{const i=l.dataset.tagId;n.has(i)?(n.delete(i),l.classList.remove("active")):(n.add(i),l.classList.add("active"))})}),n}let D=U(),L=null,R=null;function St(t){const e=new Date(D+"T12:00:00");e.setDate(e.getDate()+t),D=e.toISOString().slice(0,10)}function _t(t){const e=new Date(t+"T12:00:00"),n=U(),a=(()=>{const s=new Date;return s.setDate(s.getDate()-1),s.toISOString().slice(0,10)})();return t===n?"Today":t===a?"Yesterday":e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}function ie(t){return new Date(t+"T12:00:00").toLocaleDateString("en-US",{month:"long",year:"numeric"})}function re(t,e){return new Date(t,e+1,0).getDate()}function ce(t,e){const n=new Date(t,e,1).getDay();return n===0?6:n-1}function de(t){const e=Math.floor(t/60);return e===0?"12 AM":e===12?"12 PM":e<12?`${e} AM`:`${e-12} PM`}function et(t){return ft().filter(e=>e.date===t).sort((e,n)=>p(e.endTime)-p(n.endTime))}function Vt(t){const e=et(t);return e.length===0?0:p(e[e.length-1].endTime)}function ue(t){L=null,t.innerHTML=`
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
        ${Yt()}
      </div>
    </section>
  `,ye(t),me(t),he(t),Gt(t)}function Yt(){const t=X(),e=new Map(t.map(u=>[u.id,u])),n=et(D),a=Vt(D),s=15,o=96,l=new Array(o).fill(null);let i=0;for(const u of n){const M=p(u.endTime),b=Math.floor(i/s),E=Math.floor(M/s);for(let w=b;w<E&&w<o;w++)l[w]=u;i=M}l.reduce((u,M,b)=>M?b:u,-1);const r=0,c=24,f=L!==null?`
    <div class="entry-form-overlay" id="entry-form-overlay">
      <div class="entry-form">
        <h3>Log: ${z(it(a))} → ${z(it(L))}</h3>
        <p class="entry-duration">${J(L-a)}</p>
        <div class="form-group">
          <input type="text" id="log-note" placeholder="Note (optional)" aria-label="Note" />
        </div>
        ${t.length>0?`
        <div class="form-group">
          ${rt("entry-tags",ht)}
        </div>
        `:""}
        <div class="entry-form-actions">
          <button class="btn btn-secondary" id="entry-cancel">Cancel</button>
          <button class="btn btn-primary" id="entry-confirm">Save</button>
        </div>
      </div>
    </div>
  `:"",k=R?et(D).find(u=>u.id===R):null,g=k?(()=>{const u=et(D).indexOf(k),M=et(D);let b="00:00";for(let E=0;E<u;E++)b=M[E].endTime;return`
      <div class="entry-form-overlay" id="edit-form-overlay">
        <div class="entry-form">
          <button class="btn-icon form-close" id="edit-cancel" aria-label="Close">×</button>
          <h3>Edit: ${z(b)} → ${z(k.endTime)}</h3>
          <p class="entry-duration">${J(p(k.endTime)-p(b))}</p>
          <div class="form-group">
            <input type="text" id="edit-note" placeholder="Note (optional)" aria-label="Note" value="${k.note?F(k.note):""}" />
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
    `})():"",v=[];let h=null;for(let u=Math.floor(r*4);u<Math.floor(c*4);u++){const M=u*s,b=l[u],E=M>=a&&!b;h&&h.tx===b&&h.isAvailable===E?h.endSlot=u+1:(h&&v.push(h),h={tx:b,startSlot:u,endSlot:u+1,isAvailable:E})}h&&v.push(h);const d=Array.from({length:c-r},(u,M)=>{const b=r+M;return`<span class="cal-gutter" style="top:${M*4*28}px">${de(b*60)}</span>`}).join(""),$=v.map(u=>{u.startSlot*s,u.endSlot*s;const M=(u.endSlot-u.startSlot)*28,b=u.tx,E=b?b.tags.map(w=>e.get(w)).find(Boolean):null;if(b&&E&&C(E.colorValue),b){const w=b.tags.map(q=>e.get(q)).filter(Boolean),_=w.map((q,nt)=>`<span class="cal-nail" style="background:${C(q.colorValue)};right:${nt*6}px"></span>`).join(""),V=w.map(q=>`<span class="cal-tag-chip" style="border-color:${C(q.colorValue)};color:${C(q.colorValue)}">${F(q.name)}</span>`).join("");return`
        <div class="cal-block filled" data-tx-id="${b.id}" style="height:${M}px">
          <div class="cal-content">
            ${b.note?`<span class="cal-note">${F(b.note)}</span>`:""}
            ${w.length>0?`<div class="cal-tags">${V}</div>`:""}
          </div>
          <div class="cal-nails">${_}</div>
        </div>
      `}else if(u.isAvailable){let w="";for(let _=u.startSlot;_<u.endSlot;_++){const V=_*s,q=L!==null&&V>=a&&V<L;w+=`<div class="cal-slot available${q?" pending":""}" data-slot-mins="${V}" style="height:28px"></div>`}return w}else return`<div class="cal-block empty" style="height:${M}px"></div>`}).join(""),y=new Date,S=y.getHours()*60+y.getMinutes(),P=D===U()?`<div class="cal-now-bar" style="top:${S/(24*60)*(96*28)}px"></div>`:"";return`
    <div class="time-grid" id="time-grid">
      <div class="cal-gutter-layer">${d}</div>
      <div class="cal-blocks-layer">${$}</div>
      ${P}
    </div>
  `+f+g}function B(t){const e=t.querySelector("#date-display");e.textContent=_t(D);const n=t.querySelector("#day-content");n.innerHTML=Yt(),Gt(t)}function Gt(t){ge(t),fe(t),ve(t),pe(t)}function ge(t){const e=t.querySelector("#time-grid");e&&e.querySelectorAll(".cal-slot.available").forEach(n=>{n.addEventListener("click",()=>{L=parseInt(n.dataset.slotMins)+15,B(t)})})}function fe(t){const e=t.querySelector("#time-grid");e&&e.querySelectorAll(".cal-block.filled").forEach(n=>{n.style.cursor="pointer",n.addEventListener("click",()=>{const a=n.dataset.txId;a&&(R=a,B(t))})})}function pe(t){const e=t.querySelector("#edit-form-overlay");if(!e)return;const n=et(D).find(s=>s.id===R);if(!n)return;const a=new Set(n.tags);ct(t,"edit-tags",a),t.querySelector("#edit-save").addEventListener("click",()=>{const s=t.querySelector("#edit-note").value||void 0,o=Array.from(a),l=et(D),i=l.findIndex(k=>k.id===n.id),r=i===0?0:p(l[i-1].endTime),c=p(n.endTime),f=Math.round((c-r)/15);if(o.length>f){alert(`Too many tags: ${o.length} tags for ${f} block${f>1?"s":""}. Max 1 tag per 15-min block.`);return}te({...n,tags:o,note:s}),R=null,B(t)}),t.querySelector("#edit-cancel").addEventListener("click",()=>{R=null,B(t)}),t.querySelector("#edit-delete").addEventListener("click",()=>{n&&(ee(n.id),R=null,B(t))}),e.addEventListener("click",s=>{s.target===e&&(R=null,B(t))})}let ht=new Set;function ve(t){const e=t.querySelector("#entry-form-overlay");e&&(ct(t,"entry-tags",ht),t.querySelector("#entry-cancel").addEventListener("click",()=>{L=null,B(t)}),t.querySelector("#entry-confirm").addEventListener("click",()=>{if(L===null)return;const n=t.querySelector("#log-note").value||void 0,a=Vt(D),s=Math.round((L-a)/15),o=Array.from(ht);if(o.length>s){alert(`Too many tags: ${o.length} tags for ${s} block${s>1?"s":""}. Max 1 tag per 15-min block.`);return}const l={id:Mt(),date:D,endTime:it(L),tags:o,note:n};Qt(l),L=null,ht=new Set,B(t)}),e.addEventListener("click",n=>{n.target===e&&(L=null,B(t))}))}function ye(t){t.querySelector("#prev-day").addEventListener("click",()=>{St(-1),L=null,B(t)}),t.querySelector("#next-day").addEventListener("click",()=>{St(1),L=null,B(t)})}function me(t){const e=t.querySelector("#day-content");let n=0,a=0,s=!1,o=null;e.addEventListener("touchstart",l=>{n=l.touches[0].clientX,a=l.touches[0].clientY,s=!0,o=null},{passive:!0}),e.addEventListener("touchmove",l=>{if(!s)return;const i=l.touches[0].clientX-n,r=l.touches[0].clientY-a;o===null&&(Math.abs(i)>10||Math.abs(r)>10)&&(o=Math.abs(i)>Math.abs(r)),o&&l.preventDefault()},{passive:!1}),e.addEventListener("touchend",l=>{if(!s)return;s=!1;const i=l.changedTouches[0].clientX,r=l.changedTouches[0].clientY,c=i-n,f=r-a;Math.abs(c)>60&&Math.abs(c)>Math.abs(f)*1.5&&(c<0?St(1):St(-1),L=null,B(t))},{passive:!0})}function he(t){const e=t.querySelector("#date-picker-overlay"),n=t.querySelector("#date-display");let a,s;function o(){const r=new Date(D+"T12:00:00");a=r.getMonth(),s=r.getFullYear(),i(),e.classList.remove("hidden")}function l(){e.classList.add("hidden")}function i(){const r=t.querySelector("#picker-month-label");r.textContent=ie(`${s}-${String(a+1).padStart(2,"0")}-01`);const c=t.querySelector("#picker-grid"),f=re(s,a),k=ce(s,a);let g="";for(let v=0;v<k;v++)g+='<span class="picker-day empty"></span>';for(let v=1;v<=f;v++){const h=`${s}-${String(a+1).padStart(2,"0")}-${String(v).padStart(2,"0")}`,d=h===D,$=h===U(),y=["picker-day",d?"selected":"",$?"today":""].filter(Boolean).join(" ");g+=`<span class="${y}" data-date="${h}">${v}</span>`}c.innerHTML=g,c.querySelectorAll(".picker-day:not(.empty)").forEach(v=>{v.addEventListener("click",()=>{D=v.dataset.date,L=null,l(),B(t)})})}n.addEventListener("click",o),e.addEventListener("click",r=>{r.target===e&&l()}),t.querySelector("#picker-prev-month").addEventListener("click",()=>{a--,a<0&&(a=11,s--),i()}),t.querySelector("#picker-next-month").addEventListener("click",()=>{a++,a>11&&(a=0,s++),i()})}const be=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],Q=15;let N=0,I=null,W=null,bt=new Set;function $t(t){return pt().filter(e=>e.day===t).sort((e,n)=>p(e.endTime)-p(n.endTime))}function Xt(t){const e=$t(t);return e.length===0?0:p(e[e.length-1].endTime)}function Se(t){const e=Math.floor(t/60);return e===0?"12 AM":e===12?"12 PM":e<12?`${e} AM`:`${e-12} PM`}function j(t){const e=X(),n=new Map(e.map(d=>[d.id,d])),a=$t(N),s=Xt(N),o=96,l=new Array(o).fill(null);let i=0;for(const d of a){const $=p(d.endTime),y=Math.floor(i/Q),S=Math.floor($/Q);for(let T=y;T<S&&T<o;T++)l[T]=d;i=$}const r=[];let c=null;for(let d=0;d<o;d++){const $=d*Q,y=l[d],S=$>=s&&!y;c&&c.budget===y&&c.isAvailable===S?c.endSlot=d+1:(c&&r.push(c),c={budget:y,startSlot:d,endSlot:d+1,isAvailable:S})}c&&r.push(c);const f=Array.from({length:24},(d,$)=>`<span class="cal-gutter" style="top:${$*4*28}px">${Se($*60)}</span>`).join(""),k=r.map(d=>{d.startSlot*Q,d.endSlot*Q;const $=(d.endSlot-d.startSlot)*28,y=d.budget;if(y){const S=y.tags.map(x=>n.get(x)).filter(Boolean),T=S.map((x,u)=>`<span class="cal-nail" style="background:${C(x.colorValue)};right:${u*6}px"></span>`).join(""),P=S.map(x=>`<span class="cal-tag-chip" style="border-color:${C(x.colorValue)};color:${C(x.colorValue)}">${F(x.name)}</span>`).join("");return`
        <div class="cal-block filled" data-budget-id="${y.id}" style="height:${$}px">
          <div class="cal-content">
            ${y.note?`<span class="cal-note">${F(y.note)}</span>`:""}
            ${S.length>0?`<div class="cal-tags">${P}</div>`:""}
          </div>
          <div class="cal-nails">${T}</div>
        </div>
      `}else if(d.isAvailable){let S="";for(let T=d.startSlot;T<d.endSlot;T++){const P=T*Q,x=I!==null&&P>=s&&P<I;S+=`<div class="cal-slot available${x?" pending":""}" data-slot-mins="${P}" style="height:28px"></div>`}return S}else return`<div class="cal-block empty" style="height:${$}px"></div>`}).join(""),g=W?a.find(d=>d.id===W):null,v=g?(()=>{const d=a.indexOf(g);let $="00:00";for(let y=0;y<d;y++)$=a[y].endTime;return`
      <div class="entry-form-overlay" id="budget-edit-overlay">
        <div class="entry-form">
          <button class="btn-icon form-close" id="budget-edit-cancel" aria-label="Close">×</button>
          <h3>Edit: ${z($)} → ${z(g.endTime)}</h3>
          <p class="entry-duration">${J(p(g.endTime)-p($))}</p>
          <div class="form-group">
            <input type="text" id="budget-edit-note" placeholder="Note (optional)" value="${g.note?F(g.note):""}" />
          </div>
          ${e.length>0?`<div class="form-group">${rt("budget-edit-tags",new Set(g.tags))}</div>`:""}
          <div class="entry-form-actions">
            <button class="btn btn-danger" id="budget-edit-delete">Delete</button>
            <button class="btn btn-primary" id="budget-edit-save">Save</button>
          </div>
        </div>
      </div>
    `})():"",h=I!==null?`
    <div class="entry-form-overlay" id="budget-add-overlay">
      <div class="entry-form">
        <button class="btn-icon form-close" id="budget-add-cancel" aria-label="Close">×</button>
        <h3>Plan: ${z(it(s))} → ${z(it(I))}</h3>
        <p class="entry-duration">${J(I-s)}</p>
        <div class="form-group">
          <input type="text" id="budget-add-note" placeholder="Note (optional)" />
        </div>
        ${e.length>0?`<div class="form-group">${rt("budget-add-tags",bt)}</div>`:""}
        <div class="entry-form-actions">
          <button class="btn btn-primary" id="budget-add-save">Save</button>
        </div>
      </div>
    </div>
  `:"";t.innerHTML=`
    <section class="view-section log-view">
      <div class="day-tabs">
        ${be.map((d,$)=>`
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
  `,$e(t),ke(t),Te(t),Me(t),we(t),De(t)}function $e(t){t.querySelectorAll(".day-tab").forEach(e=>{e.addEventListener("click",()=>{N=parseInt(e.dataset.day),I=null,W=null,j(t)})})}function ke(t){const e=t.querySelector("#budget-day-content");if(!e)return;let n=0,a=0,s=!1,o=null;e.addEventListener("touchstart",l=>{n=l.touches[0].clientX,a=l.touches[0].clientY,s=!0,o=null},{passive:!0}),e.addEventListener("touchmove",l=>{if(!s)return;const i=l.touches[0].clientX-n,r=l.touches[0].clientY-a;o===null&&(Math.abs(i)>10||Math.abs(r)>10)&&(o=Math.abs(i)>Math.abs(r)),o&&l.preventDefault()},{passive:!1}),e.addEventListener("touchend",l=>{if(!s)return;s=!1;const i=l.changedTouches[0].clientX-n,r=l.changedTouches[0].clientY-a;Math.abs(i)>60&&Math.abs(i)>Math.abs(r)*1.5&&(i<0?N=(N+1)%7:N=(N+6)%7,I=null,W=null,j(t))},{passive:!0})}function Te(t){const e=t.querySelector("#budget-time-grid");e&&e.querySelectorAll(".cal-slot.available").forEach(n=>{n.addEventListener("click",()=>{I=parseInt(n.dataset.slotMins)+Q,j(t)})})}function Me(t){const e=t.querySelector("#budget-time-grid");e&&e.querySelectorAll(".cal-block.filled").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.budgetId;a&&(W=a,j(t))})})}function we(t){const e=t.querySelector("#budget-add-overlay");e&&(ct(t,"budget-add-tags",bt),t.querySelector("#budget-add-cancel").addEventListener("click",()=>{I=null,j(t)}),t.querySelector("#budget-add-save").addEventListener("click",()=>{if(I===null)return;const n=t.querySelector("#budget-add-note").value||void 0,a=Xt(N),s=Math.round((I-a)/15),o=Array.from(bt);if(o.length>s){alert(`Too many tags: ${o.length} tags for ${s} block${s>1?"s":""}. Max 1 tag per 15-min block.`);return}const l={id:Mt(),day:N,endTime:it(I),tags:o,note:n};se(l),I=null,bt=new Set,j(t)}),e.addEventListener("click",n=>{n.target===e&&(I=null,j(t))}))}function De(t){const e=t.querySelector("#budget-edit-overlay");if(!e)return;const n=$t(N).find(s=>s.id===W);if(!n)return;const a=ct(t,"budget-edit-tags",new Set(n.tags));t.querySelector("#budget-edit-cancel").addEventListener("click",()=>{W=null,j(t)}),t.querySelector("#budget-edit-save").addEventListener("click",()=>{const s=t.querySelector("#budget-edit-note").value||void 0,o=Array.from(a),l=$t(N),i=l.findIndex(k=>k.id===n.id),r=i===0?0:p(l[i-1].endTime),c=p(n.endTime),f=Math.round((c-r)/15);if(o.length>f){alert(`Too many tags: ${o.length} tags for ${f} block${f>1?"s":""}. Max 1 tag per 15-min block.`);return}oe({...n,tags:o,note:s}),W=null,j(t)}),t.querySelector("#budget-edit-delete").addEventListener("click",()=>{le(n.id),W=null,j(t)}),e.addEventListener("click",s=>{s.target===e&&(W=null,j(t))})}const vt=3;let st=null;function tt(t){const e=X(),n=lt(),a=n.filter(r=>r.period==="daily"),s=n.filter(r=>r.period==="weekly"),o=a.length<vt,l=s.length<vt,i=st?n.find(r=>r.id===st):null;t.innerHTML=`
    <section class="view-section">

      <div class="goals-section">
        <div class="goals-section-header">
          <h2>Daily</h2>
          <span class="goals-count">${a.length}/${vt}</span>
        </div>
        <ul class="goals-list">
          ${a.map(r=>Ct(r,e)).join("")}
        </ul>
        ${o?Nt("daily"):""}
      </div>

      <div class="goals-section">
        <div class="goals-section-header">
          <h2>Weekly</h2>
          <span class="goals-count">${s.length}/${vt}</span>
        </div>
        <ul class="goals-list">
          ${s.map(r=>Ct(r,e)).join("")}
        </ul>
        ${l?Nt("weekly"):""}
      </div>

      ${i?`
      <div class="entry-form-overlay" id="goal-tag-overlay">
        <div class="entry-form">
          <h3>Tags for: ${F(i.text)}</h3>
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
  `,Le(t)}function Ct(t,e){const n=new Map(e.map(s=>[s.id,s])),a=t.tags.map(s=>n.get(s)).filter(Boolean);return`
    <li class="goal-item-simple ${t.done?"done":""}">
      <button class="goal-check" data-id="${t.id}" aria-label="${t.done?"Mark undone":"Mark done"}">
        ${t.done?"✓":""}
      </button>
      <span class="goal-text">${F(t.text)}</span>
      <div class="goal-tags-area" data-id="${t.id}">
        ${a.length>0?`
          ${a.map(s=>`<span class="tag-chip-sm" style="background:${C(s.colorValue)}">${F(s.name)}</span>`).join("")}
        `:'<span class="goal-tag-hint">+ tag</span>'}
      </div>
      <button class="btn-icon btn-delete" data-id="${t.id}" aria-label="Delete goal">×</button>
    </li>
  `}function Nt(t,e){return`
    <form class="goal-add-form" data-period="${t}">
      <div class="goal-add-row">
        <input type="text" class="goal-text-input" placeholder="Add a goal..." required />
        <button type="submit" class="btn btn-primary btn-sm">+</button>
      </div>
      ${rt(`goal-tags-${t}`,new Set)}
    </form>
  `}function Le(t){t.querySelectorAll(".goal-check").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.id,o=lt().find(l=>l.id===a);o&&(Lt({...o,done:!o.done}),tt(t))})}),t.querySelectorAll(".goals-list .btn-delete").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.id;ae(a),tt(t)})}),t.querySelectorAll(".goal-add-form").forEach(n=>{const a=n,s=a.dataset.period,o=ct(t,`goal-tags-${s}`,new Set);n.addEventListener("submit",l=>{l.preventDefault();const r=a.querySelector(".goal-text-input").value.trim();if(!r)return;const c={id:Mt(),text:r,tags:Array.from(o),period:s,done:!1};ne(c),tt(t)})}),t.querySelectorAll(".goal-tags-area").forEach(n=>{n.addEventListener("click",()=>{st=n.dataset.id,tt(t)})});const e=t.querySelector("#goal-tag-overlay");if(e){const n=lt().find(a=>a.id===st);if(n){const a=ct(t,"goal-edit-tags",new Set(n.tags));t.querySelector("#goal-tag-save").addEventListener("click",()=>{Lt({...n,tags:Array.from(a)}),st=null,tt(t)}),e.addEventListener("click",s=>{s.target===e&&(Lt({...n,tags:Array.from(a)}),st=null,tt(t))})}}}let Y=U(),G=Ut(U()),H="day";function Ut(t){const e=new Date(t+"T12:00:00"),n=e.getDay(),a=e.getDate()-n+(n===0?-6:1);return e.setDate(a),e.toISOString().slice(0,10)}function Ee(t){const e=new Date(t+"T12:00:00").getDay();return e===0?6:e-1}function xe(t){const e=new Date(t+"T12:00:00"),n=U();return t===n?"Today":e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}function qe(t){const e=new Date(t+"T12:00:00"),n=new Date(t+"T12:00:00");return n.setDate(n.getDate()+6),e.getMonth()===n.getMonth()?`${e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}–${n.getDate()}`:`${e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}–${n.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`}function yt(t){const e=new Date(Y+"T12:00:00");e.setDate(e.getDate()+t),Y=e.toISOString().slice(0,10)}function mt(t){const e=new Date(G+"T12:00:00");e.setDate(e.getDate()+t*7),G=e.toISOString().slice(0,10)}function Ie(t){const e=[];for(let n=0;n<7;n++){const a=new Date(t+"T12:00:00");a.setDate(a.getDate()+n),e.push(a.toISOString().slice(0,10))}return e}function ut(t){const e=[...t].sort((s,o)=>p(s.endTime)-p(o.endTime)),n=new Map;let a="00:00";for(const s of e){const o=p(s.endTime)-p(a);if(o>0&&s.tags.length>0){const l=Math.round(o/15),i=Math.floor(l/s.tags.length),r=l-i*s.tags.length;for(let c=0;c<s.tags.length;c++){const f=i+(c<r?1:0);n.set(s.tags[c],(n.get(s.tags[c])||0)+f*15)}}a=s.endTime}return n}function jt(t){if(t.length===0)return 0;const e=[...t].sort((n,a)=>p(n.endTime)-p(a.endTime));return p(e[e.length-1].endTime)}function ot(t){const e=X(),n=pt(),a=ft(),s=new Map(e.map(m=>[m.id,m])),o=U(),l=new Date,i=Math.floor((l.getHours()*60+l.getMinutes())/15)*15,r=Ee(Y),c=a.filter(m=>m.date===Y),f=ut(c);jt(c);const k=Y===o,g=n.filter(m=>m.day===r),v=k?g.filter(m=>p(m.endTime)<=i):g,h=ut(v),d=[...v].sort((m,O)=>p(m.endTime)-p(O.endTime));d.length>0&&p(d[d.length-1].endTime);const $=ut(g),y=new Set([...f.keys(),...h.keys(),...$.keys()]),S=Ie(G),T=Ut(o),P=G===T;let x=0,u=0;const M=new Map,b=new Map;for(let m=0;m<7;m++){const O=S[m],Z=a.filter(A=>A.date===O);x+=jt(Z);const Rt=ut(Z);for(const[A,dt]of Rt)M.set(A,(M.get(A)||0)+dt);const wt=n.filter(A=>A.day===m);let at;P?O<o?at=wt:O===o?at=wt.filter(A=>p(A.endTime)<=i):at=[]:at=wt;const zt=ut(at);for(const[A,dt]of zt)b.set(A,(b.get(A)||0)+dt);const Dt=[...at].sort((A,dt)=>p(A.endTime)-p(dt.endTime));Dt.length>0&&(u+=p(Dt[Dt.length-1].endTime))}const E=new Set([...M.keys(),...b.keys()]);t.innerHTML=`
    <section class="view-section">
      <div class="day-tabs">
        <button class="day-tab ${H==="day"?"active":""}" data-mode="day">Day</button>
        <button class="day-tab ${H==="week"?"active":""}" data-mode="week">Week</button>
      </div>

      ${H==="day"?`
      <div class="balance-nav">
        <button class="nav-arrow" id="bal-prev">‹</button>
        <button class="balance-nav-label" id="bal-date-btn">${xe(Y)}</button>
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
        <button class="balance-nav-label" id="bal-date-btn">${qe(G)}</button>
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
      ${E.size>0?`
      <ul class="balance-list">
        ${Ft(E,b,M,s)}
      </ul>
      `:'<p class="hint">No data for this week.</p>'}
      `}
    </section>
  `,t.querySelectorAll(".day-tab").forEach(m=>{m.addEventListener("click",()=>{H=m.dataset.mode,ot(t)})}),t.querySelector("#bal-prev").addEventListener("click",()=>{H==="day"?yt(-1):mt(-1),ot(t)}),t.querySelector("#bal-next").addEventListener("click",()=>{H==="day"?yt(1):mt(1),ot(t)}),Ae(t);const w=t.querySelector(".view-section");let _=0,V=0,q=!1,nt=null;w.addEventListener("touchstart",m=>{_=m.touches[0].clientX,V=m.touches[0].clientY,q=!0,nt=null},{passive:!0}),w.addEventListener("touchmove",m=>{if(!q)return;const O=m.touches[0].clientX-_,Z=m.touches[0].clientY-V;nt===null&&(Math.abs(O)>10||Math.abs(Z)>10)&&(nt=Math.abs(O)>Math.abs(Z)),nt&&m.preventDefault()},{passive:!1}),w.addEventListener("touchend",m=>{if(!q)return;q=!1;const O=m.changedTouches[0].clientX-_,Z=m.changedTouches[0].clientY-V;Math.abs(O)>60&&Math.abs(O)>Math.abs(Z)*1.5&&(O<0?H==="day"?yt(1):mt(1):H==="day"?yt(-1):mt(-1),ot(t))},{passive:!0})}function Ae(t){const e=t.querySelector("#bal-picker-overlay"),n=t.querySelector("#bal-date-btn");if(!e||!n)return;let a,s;function o(){return H==="day"?new Date(Y+"T12:00:00"):new Date(G+"T12:00:00")}function l(){const g=o();a=g.getMonth(),s=g.getFullYear(),k(),e.classList.remove("hidden")}function i(){e.classList.add("hidden")}function r(g,v){return new Date(g,v+1,0).getDate()}function c(g,v){const h=new Date(g,v,1).getDay();return h===0?6:h-1}function f(g){const v=new Date(g+"T12:00:00"),h=v.getDay(),d=v.getDate()-h+(h===0?-6:1);return v.setDate(d),v.toISOString().slice(0,10)}function k(){const g=t.querySelector("#bal-picker-month"),v=["January","February","March","April","May","June","July","August","September","October","November","December"];g.textContent=`${v[a]} ${s}`;const h=t.querySelector("#bal-picker-grid"),d=r(s,a),$=c(s,a);let y="";for(let S=0;S<$;S++)y+='<span class="picker-day empty"></span>';for(let S=1;S<=d;S++){const T=`${s}-${String(a+1).padStart(2,"0")}-${String(S).padStart(2,"0")}`,P=H==="day"?T===Y:f(T)===G,x=T===U(),u=H==="week"&&f(T)===G,M=["picker-day",P?"selected":"",x?"today":"",u?"week-highlight":""].filter(Boolean).join(" ");y+=`<span class="${M}" data-date="${T}">${S}</span>`}h.innerHTML=y,h.querySelectorAll(".picker-day:not(.empty)").forEach(S=>{S.addEventListener("click",()=>{const T=S.dataset.date;H==="day"?Y=T:G=f(T),i(),ot(t)})})}n.addEventListener("click",l),e.addEventListener("click",g=>{g.target===e&&i()}),t.querySelector("#bal-picker-prev").addEventListener("click",()=>{a--,a<0&&(a=11,s--),k()}),t.querySelector("#bal-picker-next").addEventListener("click",()=>{a++,a>11&&(a=0,s++),k()})}function Ft(t,e,n,a){return Array.from(t).map(s=>{const o=a.get(s),l=o?C(o.colorValue):"#888",i=o?F(o.name):"Unknown",r=e.get(s)||0,c=n.get(s)||0,f=c-r,k=f>0?"over":f<0?"under":"even",g=f===0?"On track":f>0?`+${J(f)} over`:`${J(Math.abs(f))} under`;return`
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
            <span class="tag-chip" style="background:${C(a.colorValue)}">${F(a.name)}</span>
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
  `,t.querySelectorAll(".color-swatch").forEach(a=>{a.addEventListener("click",()=>{Et=parseInt(a.dataset.color),t.querySelectorAll(".color-swatch").forEach(s=>s.classList.remove("active")),a.classList.add("active")})}),t.querySelector("#tag-form").addEventListener("submit",a=>{a.preventDefault();const s=document.getElementById("tag-name").value.trim();if(!s)return;const o={id:Mt(),name:s,colorValue:Et};Jt(o),gt(t)}),t.querySelectorAll(".btn-delete").forEach(a=>{a.addEventListener("click",()=>{const s=a.dataset.id;confirm("Delete this tag?")&&(Zt(s),gt(t))})}),t.querySelectorAll(".btn-edit").forEach(a=>{a.addEventListener("click",()=>{const s=a.dataset.id,o=e.find(i=>i.id===s);if(!o)return;const l=prompt("Rename tag:",o.name);l&&l.trim()&&(Kt({...o,name:l.trim()}),gt(t))})}),t.querySelector("#export-btn").addEventListener("click",()=>{const a=t.querySelector("#export-email"),s=a.value.trim();if(!s||!a.validity.valid){a.reportValidity();return}const o={tags:localStorage.getItem("talloc_tags"),transactions:localStorage.getItem("talloc_transactions"),goals:localStorage.getItem("talloc_goals"),budgets:localStorage.getItem("talloc_budgets")},l=JSON.stringify(o,null,2),i=`Talloc Export — ${new Date().toISOString().slice(0,10)}`;if(navigator.share&&navigator.canShare){const r=new File([l],`talloc-export-${new Date().toISOString().slice(0,10)}.json`,{type:"application/json"}),c={title:i,files:[r]};if(navigator.canShare(c)){navigator.share(c).catch(()=>{Pt(s,i,l)});return}}Pt(s,i,l)}),t.querySelector("#clear-btn").addEventListener("click",()=>{confirm("This will delete ALL your data. Are you sure?")&&(localStorage.removeItem("talloc_tags"),localStorage.removeItem("talloc_transactions"),localStorage.removeItem("talloc_goals"),localStorage.removeItem("talloc_budgets"),gt(t))})}function Pt(t,e,n){const s=n.length>1500?n.slice(0,1500)+`
...(truncated, use Share for full data)`:n,o=`mailto:${encodeURIComponent(t)}?subject=${encodeURIComponent(e)}&body=${encodeURIComponent(s)}`;window.location.href=o}function Be(){document.addEventListener("focusin",t=>{const e=t.target;Oe(e)&&setTimeout(()=>{e.scrollIntoView({behavior:"smooth",block:"center"})},350)})}function Oe(t){const e=t.tagName.toLowerCase();return e==="input"||e==="textarea"||e==="select"}const qt={log:ue,budgets:j,goals:tt,balance:ot,settings:gt};let It="log";function xt(t){It=t;const e=document.getElementById("view-container");document.querySelectorAll(".nav-btn").forEach(n=>{n.classList.toggle("active",n.dataset.view===t)}),qt[t](e),window.location.hash=t}function He(){const t=window.location.hash.slice(1);t&&t in qt&&(It=t),document.querySelectorAll(".nav-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.view;xt(n)})}),window.addEventListener("hashchange",()=>{const e=window.location.hash.slice(1);e&&e in qt&&xt(e)}),xt(It)}"serviceWorker"in navigator&&navigator.serviceWorker.register("/talloc/sw.js").catch(()=>{});Be();He();
