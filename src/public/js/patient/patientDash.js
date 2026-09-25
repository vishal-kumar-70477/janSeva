function icons(){try{lucide.createIcons()}catch(e){}}
icons();
setTimeout(()=>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in')),1200);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
setTimeout(()=>{document.getElementById('ring').style.transition='stroke-dashoffset 1.2s ease';document.getElementById('ring').style.strokeDashoffset=188.5*(1-0.82);},400);

const symptoms=['Chest pain','Breathing difficulty','Severe bleeding','Loss of consciousness','Severe pain','Accident / Injury'];
document.querySelector('#emgModal .grid.grid-cols-2').innerHTML=symptoms.map(s=>`<label class="flex items-center gap-2 border border-line rounded-lg px-3 py-2"><input type="checkbox">${s}</label>`).join('')+`
 <div class="col-span-2 mt-2"><label class="font-semibold">When did it start?</label><input type="text" placeholder="e.g. 10 minutes ago" class="mt-1 w-full rounded-xl border border-line bg-soft px-3 py-2"></div>
 <div class="col-span-2"><label class="font-semibold">Current condition</label><select class="mt-1 w-full rounded-xl border border-line bg-soft px-3 py-2"><option>Conscious</option><option>Unconscious</option><option>Difficulty speaking</option><option>Difficulty breathing</option></select></div>
 <div class="col-span-2"><label class="font-semibold">Upload current report/photo (optional)</label><input type="file" class="mt-1 w-full text-xs"></div>
 <button class="col-span-2 mt-2 rounded-full bg-emerg text-white py-3 font-bold">Continue →</button>`;

function openEmg(){document.getElementById('emgModal').classList.remove('hidden');document.body.style.overflow='hidden';icons()}
function closeEmg(){document.getElementById('emgModal').classList.add('hidden');document.body.style.overflow=''}
function submitEmg(e){e.preventDefault();closeEmg();alert('Demo: emergency case created using your existing profile.');return false}
document.addEventListener('click',e=>{if(e.target.id==='emgModal')closeEmg();if(!e.target.closest('#pmenu')&&!e.target.closest('button'))document.getElementById('pmenu')?.classList.add('hidden')});