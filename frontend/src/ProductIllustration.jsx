import React from "react";
import "./ProductIllustration.css";

// Original illustrative placeholder: never misrepresent this as an actual seller photo.
function classify(product) {
  const name = String(product?.name || "").toLocaleLowerCase("uz").replace(/[‘’ʻʼ]/g, "'");
  const category = String(product?.category || "").toLocaleLowerCase("uz");
  if (/grechka|guruch|shakar|makaron|un\b|mosh|loviy|yorma/.test(name)) return "grains";
  if (/non\b|bread|patir|bulochka/.test(name)) return "bread";
  if (/choy|tea|coffee|kofe/.test(name)) return "tea";
  if (/red bull|energetik/.test(name)) return "can";
  if (/sok|sharbat|juice|bliss|dena/.test(name)) return "juice";
  if (/suv|water|lipton|fanta|cola|sprite|pepsi|ichimlik/.test(name) || category.includes("ichimlik")) return "bottle";
  if (/ariel|persil|vanish|kir yuv|kukun|soda|domestos|cif|fairy|tozalagich/.test(name) || category.includes("kimyo")) return "cleaner";
  if (/colgate|tish past/.test(name)) return "toothpaste";
  if (/paxta|disklar|salfetka|salfet/.test(name)) return "cotton";
  if (/shampun|head|shoulders|pantene|nivea|krem|sovun|gel|dezodorant/.test(name) || category.includes("gigiyena")) return "cosmetic";
  if (/rasm daft|daftar|kitob|albom/.test(name)) return "notebook";
  if (/qo'g'irchoq|teddy|ayiqcha|yumshoq o'yinchoq/.test(name)) return "teddy";
  if (/kubik|lego|konstruktor/.test(name)) return "blocks";
  if (/chashka|piyola|krujka/.test(name)) return "cup";
  if (/sochiq|salfetka|matolar/.test(name)) return "towel";
  if (/termos|butilka/.test(name)) return "thermos";
  if (/konteyner|saqlash|quti/.test(name)) return "storage";
  if (/power\s*bank|paverbank|akkumulyator/.test(name)) return "powerbank";
  if (/adapter|zaryad|charger|usb-c/.test(name)) return "adapter";
  if (/ushlagich|holder|stend/.test(name)) return "holder";
  if (/sichqoncha|mouse/.test(name)) return "mouse";
  if (/quloqchin|headphone|naushnik/.test(name)) return "headphones";
  if (/futbol|koptok|basketbol|to'p/.test(name)) return "ball";
  if (/gantel|fitness|trenajor/.test(name)) return "dumbbell";
  if (/krossovka|oyoq kiyim/.test(name)) return "shoe";
  if (/tennis|raketka/.test(name)) return "racket";
  if (/arqon|skakalka/.test(name)) return "rope";
  if (/yoga|mat\b/.test(name)) return "yoga";
  if (category.includes("elektron")) return "electronics";
  if (category.includes("bolalar")) return "toy";
  if (category.includes("uy")) return "home";
  if (category.includes("oziq")) return "groceries";
  return "package";
}
const themes = {
  grains:["#f6e8d2","#b57a44","#e0b77b"], bread:["#fff0d9","#b8753e","#e6ab65"],
  tea:["#e4f0dc","#548365","#bdd7ac"], can:["#fae0e7","#cb4662","#f3adbb"],
  juice:["#fce7e2","#e78067","#ffc6a2"], bottle:["#e1f2f4","#4395aa","#a8d9e6"],
  cleaner:["#ebe9ff","#6f60c5","#bfb6fb"], toothpaste:["#dbeefc","#3580c1","#b5d9f7"],
  cotton:["#fce6ed","#d786a4","#f8c2d0"], cosmetic:["#fbe5ec","#c96c98","#f6b6cb"],
  notebook:["#e9e7ff","#7063cb","#c3bdff"], teddy:["#fff0e5","#bc7d52","#edc09d"],
  blocks:["#e4f6ee","#48a897","#a8e5cd"], cup:["#e6f0ff","#658ac4","#bad1f3"],
  towel:["#f4e8fe","#ad82c7","#dfc8f0"], thermos:["#ddecff","#507db2","#a8cbea"],
  storage:["#eaf5ec","#639c76","#b8d8bf"], powerbank:["#e8edfb","#546fa8","#bdcbed"],
  adapter:["#e9edfc","#6678a7","#bdc4e2"], holder:["#eff0f7","#858ba6","#c3c7d8"],
  mouse:["#ece8fb","#7e75b6","#c4bce6"], headphones:["#e6eafa","#596dba","#bbc6f0"],
  ball:["#e7f3ff","#478cca","#aacbed"], dumbbell:["#e9eef7","#65748b","#b8c3d6"],
  shoe:["#e4f2fb","#527cad","#b2d5ee"], racket:["#ecf6ee","#5e9986","#c3e6d5"],
  rope:["#fff0e4","#d58b58","#f3c8a5"], yoga:["#ede9fd","#8979c7","#cfc4f0"],
  electronics:["#e6edf9","#6276b1","#becaeb"], toy:["#fef0df","#d08b61","#f6c9a7"],
  groceries:["#f7ecdf","#bd8b59","#e4c6a2"], home:["#e9f0ed","#77988a","#bdd3c7"],
  package:["#e9edf9","#7e89b0","#c5cbea"]
};
function Drawing({ type, color, light }) {
  const base = { stroke:"#fff", strokeWidth:2, strokeLinejoin:"round", strokeLinecap:"round" };
  switch (type) {
    case "grains": return <><ellipse cx="140" cy="189" rx="75" ry="14" fill="#5a3b2220"/><path d="M66 122q10 81 74 81t74-81Z" fill="#f9f4e9" stroke="#d8c7ad" strokeWidth="3"/><ellipse cx="140" cy="122" rx="73" ry="24" fill={color}/>{Array.from({length:38},(_,i)=>{let x=80+(i*43%120),y=107+(i*19%30);return <ellipse key={i} cx={x} cy={y} rx="5" ry="3.2" fill={i%3===0?light:i%2?"#8c602f":"#d9ae75"} transform={`rotate(${i*31%110} ${x} ${y})`}/>})}</>;
    case "bread": return <><ellipse cx="140" cy="201" rx="81" ry="13" fill="#614a3a19"/><path d="M58 136Q48 98 80 91q12-42 49-28 38-25 61 15 41-3 37 48l-16 62H76Z" fill={color}/><path d="M71 137q55-29 138 1l-9 41H81Z" fill={light}/><path d="m106 104 12-14m20 13 12-18m16 24 13-12" stroke="#fff1d2" strokeWidth="7" strokeLinecap="round"/></>;
    case "tea":return <><ellipse cx="140" cy="202" rx="72" ry="12" fill="#345b3b19"/><rect x="91" y="82" width="98" height="113" rx="14" fill={color}/><rect x="87" y="77" width="106" height="17" rx="7" fill="#3f6c55"/><rect x="103" y="111" width="74" height="66" rx="9" fill="#fefcf2"/><path d="M141 117q-32 18 0 44 30-22 0-44Z" fill={light}/><path d="M130 158q13-28 30-34" stroke={color} strokeWidth="4" fill="none"/></>;
    case "can":return <><ellipse cx="140" cy="206" rx="55" ry="11" fill="#54313a19"/><rect x="100" y="66" width="80" height="135" rx="13" fill={color}/><rect x="104" y="65" width="72" height="10" rx="5" fill="#d0d5de"/><rect x="105" y="189" width="70" height="12" rx="6" fill="#bdc4cf"/><path d="m154 93-31 41h20l-19 42 39-50h-24Z" fill="#fff"/><path d="M116 84v99" stroke="#ffffff5c" strokeWidth="8" strokeLinecap="round"/></>;
    case "juice":return <><ellipse cx="140" cy="207" rx="65" ry="12" fill="#5733281c"/><path d="M97 80h86l9 108q-52 28-104 0Z" fill={light}/><path d="M97 80l43-24 43 24-43 20Z" fill="#fff1dd"/><path d="m140 56 0 44" stroke={color} strokeWidth="3"/><path d="M109 109h61v64h-61Z" rx="4" fill="#fff7f0"/><circle cx="140" cy="140" r="23" fill={color}/><path d="M125 150q15-29 28-20" stroke="#fff6df" strokeWidth="5" fill="none"/><path d="M140 100v-28l12-13" stroke={color} strokeWidth="5" fill="none"/></>;
    case "bottle": case "thermos":return <><ellipse cx="140" cy="209" rx="58" ry="11" fill="#244a5819"/><rect x="117" y="51" width="46" height="29" rx="6" fill="#455f70"/><path d="M110 80q-12 12-12 28v85q0 15 15 15h54q15 0 15-15v-85q0-16-12-28Z" fill={light}/><path d="M102 126h76v56h-76Z" fill={color}/><rect x="120" y="57" width="40" height="7" rx="3" fill="#718ba3"/><path d="M120 91v108" stroke="#fff9" strokeWidth="9" strokeLinecap="round"/></>;
    case "cleaner":case "cosmetic":return <><ellipse cx="140" cy="208" rx="61" ry="11" fill="#5542671a"/><rect x="111" y="60" width="58" height="31" rx="7" fill={color}/><rect x="119" y="51" width="42" height="15" rx="5" fill="#4c5279"/><path d="M105 89h70q9 10 9 24v76q0 17-17 17h-54q-17 0-17-17v-76q0-14 9-24Z" fill={light}/><rect x="105" y="117" width="70" height="59" rx="12" fill="#fffefa"/><path d="M140 126q-19 22 0 43 19-20 0-43Z" fill={color}/><path d="M117 95v101" stroke="#fff9" strokeWidth="8" strokeLinecap="round"/></>;
    case "toothpaste":return <><ellipse cx="140" cy="201" rx="89" ry="11" fill="#33537714"/><path d="M64 155 191 108l21 56-124 45Z" fill={light}/><path d="M64 155 49 162l17 42 22 5Z" fill="#d5dfea"/><rect x="98" y="157" width="96" height="18" rx="9" fill="#fff" transform="rotate(-20 98 157)"/><path d="m130 141 52-20" stroke={color} strokeWidth="10" strokeLinecap="round"/></>;
    case "cotton":return <><ellipse cx="140" cy="204" rx="79" ry="12" fill="#64445a16"/><rect x="84" y="91" width="112" height="110" rx="16" fill={light}/><rect x="84" y="91" width="112" height="22" rx="10" fill={color}/>{[0,1,2].map((i)=><g key={i}><circle cx={111+i*29} cy={150+(i%2)*10} r="22" fill="#fff" stroke="#f5d8e5" strokeWidth="3"/></g>)}</>;
    case "notebook":return <><ellipse cx="140" cy="207" rx="86" ry="10" fill="#3e3b6b18"/><path d="M85 61 202 82l-16 126L68 187Z" fill={color}/><path d="m94 68 99 17-13 110-100-17Z" fill={light}/><path d="m106 105 59 11m-63 12 55 10m-59 13 59 10" stroke="#fff" strokeWidth="5"/><path d="m90 63-20 120" stroke="#56508c" strokeWidth="8"/></>;
    case "teddy":return <><ellipse cx="140" cy="215" rx="79" ry="11" fill="#75432416"/><circle cx="97" cy="81" r="23" fill={color}/><circle cx="183" cy="81" r="23" fill={color}/><ellipse cx="140" cy="163" rx="57" ry="54" fill={color}/><circle cx="140" cy="106" r="55" fill={light}/><ellipse cx="140" cy="122" rx="24" ry="19" fill="#fff1df"/><circle cx="140" cy="114" r="7" fill="#5f3e35"/><circle cx="119" cy="96" r="5" fill="#5f3e35"/><circle cx="162" cy="96" r="5" fill="#5f3e35"/><ellipse cx="140" cy="168" rx="25" ry="32" fill="#f8e4cd"/></>;
    case "blocks":return <><ellipse cx="140" cy="211" rx="88" ry="12" fill="#264e3b16"/>{[[70,124,"#f5b458"],[139,108,color],[115,151,light]].map(([x,y,c],i)=><g key={i}><rect x={x} y={y} width="70" height="53" rx="5" fill={c}/><path d={`M${x} ${y} l22 -16 h70 l-22 16Z`} fill="#fff8"/><circle cx={x+22} cy={y-5} r="7" fill={c}/><circle cx={x+49} cy={y-5} r="7" fill={c}/></g>)}</>;
    case "cup":return <><ellipse cx="140" cy="207" rx="83" ry="12" fill="#34547914"/><path d="M88 101h95l-11 94q-36 20-73 0Z" fill={light}/><path d="M183 120q51-12 37 26-8 24-41 20" fill="none" stroke={color} strokeWidth="14"/><ellipse cx="135" cy="102" rx="47" ry="13" fill={color}/><ellipse cx="135" cy="103" rx="40" ry="8" fill="#fff" opacity=".75"/></>;
    case "towel":return <><ellipse cx="140" cy="211" rx="86" ry="11" fill="#56446a14"/><rect x="74" y="113" width="132" height="91" rx="13" fill={color}/><rect x="81" y="87" width="118" height="100" rx="12" fill={light}/><path d="M83 115h112m-112 44h112" stroke="#fff9" strokeWidth="7"/><rect x="91" y="62" width="99" height="64" rx="10" fill="#fff6"/></>;
    case "storage":return <><ellipse cx="140" cy="210" rx="87" ry="10" fill="#33574414"/><rect x="63" y="104" width="154" height="99" rx="13" fill={light}/><path d="M55 96h170v20H55Z" fill={color}/><rect x="83" y="123" width="114" height="65" rx="8" fill="#fff7"/><path d="M140 123v65" stroke={light} strokeWidth="6"/></>;
    case "powerbank":return <><ellipse cx="140" cy="205" rx="74" ry="11" fill="#243a6d19"/><rect x="91" y="69" width="98" height="132" rx="21" fill={color}/><rect x="101" y="76" width="78" height="110" rx="16" fill={light}/><path d="M148 111 125 147h19l-14 27 30-42h-19Z" fill="#fff"/><circle cx="140" cy="190" r="4" fill="#fff"/></>;
    case "adapter":return <><ellipse cx="140" cy="205" rx="67" ry="10" fill="#32436b16"/><rect x="93" y="91" width="94" height="96" rx="20" fill={light}/><rect x="115" y="65" width="10" height="37" rx="4" fill="#bfc6d8"/><rect x="153" y="65" width="10" height="37" rx="4" fill="#bfc6d8"/><rect x="114" y="117" width="52" height="30" rx="10" fill={color}/><rect x="132" y="175" width="16" height="12" rx="4" fill="#fff"/></>;
    case "holder":return <><ellipse cx="140" cy="204" rx="84" ry="12" fill="#36415d17"/><rect x="102" y="65" width="76" height="91" rx="13" fill="#2e3855"/><rect x="110" y="75" width="60" height="72" rx="6" fill={light}/><path d="M140 157v32M92 194h96" stroke={color} strokeWidth="13" strokeLinecap="round"/></>;
    case "mouse":return <><ellipse cx="140" cy="206" rx="72" ry="11" fill="#33325c19"/><path d="M140 65c-37 0-58 30-58 69v26c0 36 24 50 58 50s58-14 58-50v-26c0-39-21-69-58-69Z" fill={color}/><path d="M140 65v62" stroke="#fff9" strokeWidth="5"/><rect x="134" y="94" width="12" height="27" rx="6" fill="#fff"/><path d="M101 164q39 18 78 0" stroke={light} strokeWidth="7" fill="none"/></>;
    case "headphones":return <><path d="M78 147V121c0-86 124-86 124 0v26" fill="none" stroke={color} strokeWidth="20"/><rect x="67" y="123" width="35" height="73" rx="16" fill={light}/><rect x="178" y="123" width="35" height="73" rx="16" fill={light}/><path d="M79 126v60m122-60v60" stroke="#fff9" strokeWidth="7"/></>;
    case "ball":return <><ellipse cx="140" cy="209" rx="77" ry="11" fill="#2d506919"/><circle cx="140" cy="132" r="73" fill="#fff" stroke={color} strokeWidth="4"/><path d="m140 105-28 21 11 32h34l11-32Z" fill="#28364e"/><path d="m140 105-13-31m41 52 31-19m-42 51 11 38m-45-38-28 35m17-67-31-18" stroke="#28364e" strokeWidth="7" fill="none"/><circle cx="140" cy="132" r="70" fill="none" stroke={light} strokeWidth="3"/></>;
    case "dumbbell":return <><ellipse cx="140" cy="204" rx="88" ry="12" fill="#26375418"/><path d="m80 150 119-27" stroke="#69758b" strokeWidth="23" strokeLinecap="round"/><rect x="59" y="101" width="43" height="88" rx="10" fill={color} transform="rotate(-14 80 145)"/><rect x="176" y="75" width="43" height="88" rx="10" fill={color} transform="rotate(-14 198 119)"/></>;
    case "shoe":return <><ellipse cx="140" cy="199" rx="99" ry="14" fill="#2d496818"/><path d="M49 160q34-6 66-70 20 46 45 47l64 13q22 10 17 35H54Q39 185 49 160Z" fill={color}/><path d="M54 177h183v15H54Z" fill="#fff"/><path d="m116 115 40 34m-30-43 40 34" stroke="#fff" strokeWidth="7" strokeLinecap="round"/><path d="m59 164 36-8" stroke={light} strokeWidth="9" strokeLinecap="round"/></>;
    case "racket":return <><ellipse cx="140" cy="208" rx="66" ry="11" fill="#315e4816"/><ellipse cx="126" cy="105" rx="57" ry="74" fill="none" stroke={color} strokeWidth="12"/>{[0,1,2,3,4].map(i=><g key={i}><path d={`M${91+i*17} 49v111`} stroke="#b2ccd1" strokeWidth="2"/><path d={`M77 ${66+i*18}h98`} stroke="#b2ccd1" strokeWidth="2"/></g>)}<path d="m153 166 44 57" stroke="#344c62" strokeWidth="14" strokeLinecap="round"/></>;
    case "rope":return <><ellipse cx="140" cy="205" rx="76" ry="10" fill="#583c2318"/><path d="M104 87C39 76 39 186 135 173s112-80 49-85" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"/><rect x="76" y="77" width="24" height="66" rx="11" fill={light} transform="rotate(-26 88 110)"/><rect x="184" y="80" width="24" height="66" rx="11" fill={light} transform="rotate(26 196 113)"/></>;
    case "yoga":return <><ellipse cx="140" cy="207" rx="96" ry="12" fill="#46325c14"/><path d="M49 167h165l27 30H22Z" fill={color}/><path d="M56 158h150l20 25H35Z" fill={light}/><circle cx="55" cy="174" r="16" fill={color}/></>;
    default:return <><ellipse cx="140" cy="207" rx="76" ry="10" fill="#333d5b16"/><path d="m75 87 67-35 68 35v99l-68 34-67-34Z" fill={light}/><path d="m75 87 67 35 68-35M142 122v98" fill="none" stroke="#fff" strokeWidth="5"/><path d="m108 71 69 34" stroke={color} strokeWidth="15"/></>;
  }
}
export default function ProductIllustration({ product }) {
  const type = classify(product);
  const [bg, color, light] = themes[type] || themes.package;
  return <div className="mm-product-illustration" style={{"--illustration-bg":bg,"--illustration-color":color}}>
    <div className="mm-illustration-orbit" aria-hidden="true"/>
    <svg viewBox="0 0 280 240" role="img" aria-label={String(product?.name||"Mahsulot")+" — namuna illustratsiya"} preserveAspectRatio="xMidYMid meet">
      <circle cx="140" cy="129" r="106" fill="#fff" opacity=".25"/>
      <Drawing type={type} color={color} light={light}/>
    </svg>
    <span className="mm-illustration-label">Namuna illustratsiya</span>
  </div>;
}
