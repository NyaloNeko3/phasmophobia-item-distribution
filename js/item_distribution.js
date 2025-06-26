const ITEM_LIST = [
  "EMF",
  "温度計",
  "UVライト",
  "浄化香",
  "ゴーストライティング",
  "DOTSプロジェクター",
  "ビデオカメラ",
  "スピリットボックス",
  "十字架",
  "塩",
  "フォトカメラ",
  "キャンドル",
  "指向性マイク",
  "モーションセンサー",
  /*"サウンドセンサー",*/
  "サウンドレコーダー",
];
const DEFAULT_TIERS = {
  1: ["EMF", "温度計", "UVライト", "浄化香"],
  2: ["ゴーストライティング", "DOTSプロジェクター", "ビデオカメラ", "スピリットボックス"],
  3: ["十字架", "塩", "フォトカメラ", "キャンドル"],
  4: ["指向性マイク", "モーションセンサー", /*"サウンドセンサー",*/ "サウンドレコーダー"],
};
const PRESET_2_MAP = {
  1: ["EMF", "温度計", "UVライト", "浄化香"],
  2: ["サウンドレコーダー", "フォトカメラ", "ビデオカメラ", "スピリットボックス"],
  3: ["十字架", "塩", "ゴーストライティング", "DOTSプロジェクター"],
  4: ["指向性マイク", "モーションセンサー", "キャンドル"],
};
const DISABLE_CANDIDATES= [
  "EMF", "温度計", "UVライト", "ゴーストライティング", "DOTSプロジェクター", "ビデオカメラ", "スピリットボックス", "十字架", "塩", "フォトカメラ", "キャンドル", "指向性マイク", "モーションセンサー", /*"サウンドセンサー"*/"サウンドレコーダー", "呪物"
]

const CURSED_ITEM = "呪物";
const EXCLUDE = ["ライター", "頭装備", "安定剤"];

const inputs = [...document.querySelectorAll("#inputs input")];
const includeCursed = document.getElementById("includeCursed");
const tierSettings = document.getElementById("tierSettings");
const tierButtons = document.getElementById("tierButtons");
const resultDiv = document.getElementById("result");
const disableRandom = document.getElementById("disableRandom");
document.getElementById("drawBtn").addEventListener("click", draw);

ITEM_LIST.forEach((item) => {
  const label = document.createElement("span");
  label.textContent = item;
  const select = document.createElement("select");
  select.dataset.item = item;
  [
    ["none", "なし"],
    ["1", "グループ1"],
    ["2", "グループ2"],
    ["3", "グループ3"],
    ["4", "グループ4"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    select.appendChild(o);
  });
  let def = "none";
  for (const [tier, arr] of Object.entries(DEFAULT_TIERS))
    if (arr.includes(item)) {
      def = tier;
      break;
    }
  select.value = def;
  tierSettings.append(label, select);
});

const resetBtn = document.createElement("button");
resetBtn.textContent = "初期化";
resetBtn.onclick = () =>
  tierSettings
    .querySelectorAll("select")
    .forEach((sel) => (sel.value = "none"));

const presetBtn = document.createElement("button");
presetBtn.textContent = "プリセット 1";
presetBtn.onclick = () => {
  tierSettings.querySelectorAll("select").forEach((sel) => {
    const it = sel.dataset.item;
    let val = "none";
    for (const [t, arr] of Object.entries(DEFAULT_TIERS))
      if (arr.includes(it)) {
        val = t;
        break;
      }
    sel.value = val;
  });
};

const presetBtn2 = document.createElement("button");
presetBtn2.textContent = "プリセット 2";
presetBtn2.onclick = () => {
  tierSettings.querySelectorAll("select").forEach((sel) => {
    const it = sel.dataset.item;
    let val = "none";
    for (const [t, arr] of Object.entries(PRESET_2_MAP))
      if (arr.includes(it)){
        val = t;
        break;
      }
    sel.value = val;
  });
};

tierButtons.append(resetBtn, presetBtn, presetBtn2);

function draw() {
  resultDiv.innerHTML = "";
  const names = inputs.map((inp) => inp.value.trim()).filter(Boolean);
  if (names.length < 2) {
    alert("プレイヤー名は最低 2 人入力してください。");
    return;
  }
  if (names.length > 4) {
    alert("プレイヤーは最大 4 人までです。");
    return;
  }

  const tierMap = { 1: [], 2: [], 3: [], 4: [] };
  const tierCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
  tierSettings.querySelectorAll("select").forEach((sel) => {
    if (["1", "2", "3", "4"].includes(sel.value)) {
      tierMap[sel.value].push(sel.dataset.item);
      tierCount[sel.value]++;
    }
  });
  if (includeCursed.checked) {
    tierMap[4].push(CURSED_ITEM);
  }
  const over = Object.entries(tierCount).find(([t, c]) => c > 4);
  if (over) {
    alert(`グループ${over[0]} は最大 4 個までです。（現在 ${over[1]} 個選択）`);
    return;
  }

  let disabledItem = null;
  if (disableRandom.checked){
    const candidates = DISABLE_CANDIDATES.filter((it) => !(it === CURSED_ITEM && !includeCursed.checked));
    disabledItem = candidates[(Math.random() * candidates.length) | 0];

    Object.values(tierMap).forEach((arr) => {
      const idx = arr.indexOf(disabledItem);
      if (idx !== -1)
        arr.splice(idx, 1);
    });
  }

  const selectedSet = new Set();
  let items = [
    ...tierMap[1],
    ...tierMap[2],
    ...tierMap[3],
    ...tierMap[4],
  ].filter((it) => {
    selectedSet.add(it);
    return !EXCLUDE.includes(it) && it !== disabledItem;
  });
  tierSettings.querySelectorAll("select").forEach((sel) => {
    const item = sel.dataset.item;
    if (
      sel.value === "none" &&
      !selectedSet.has(item) &&
      !EXCLUDE.includes(item)
    ) {
      items.push(item);
    }
  });

  // 呪物を含むにチェック かつ ランダム除外アイテムが呪物ではない場合は分配リストに呪物を追加する
  if (includeCursed.checked && disabledItem !== CURSED_ITEM) {
    items.push(CURSED_ITEM);
  }

  const useTierPriority = tierMap[1].length + tierMap[2].length + tierMap[3].length + tierMap[4].length > 0;

  const queue = useTierPriority
    ? [
        ...shuffle(tierMap[1]),
        ...shuffle(tierMap[2]),
        ...shuffle(tierMap[3]),
        ...shuffle(tierMap[4]),
        ...shuffle(items.filter((it) => !selectedSet.has(it))),
      ]
    : shuffle([...items]);

  /* --- 均等配分 --- */
  const n = names.length;
  const assigned = Array.from({ length: n }, () => []);
  const totals = Array(n).fill(0);
  const targets = Array(n).fill(Math.floor(items.length / n));
  for (let i = 0; i < items.length % n; i++) targets[i]++;
  shuffle(targets); // ランダム配分順

  queue.forEach(assign);

  if (disabledItem)
  {
    const note = document.createElement("div");
    note.className = "player-card";
    note.textContent = `❌ 今回使えないアイテム: ${disabledItem}`;
    resultDiv.appendChild(note);
  }

  names.forEach((name, i) => {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `<span class="player-name">${name}:</span> ${assigned[
      i
    ].join(" / ")}`;
    resultDiv.appendChild(card);
  });

  function assign(item) {
    let cand = [...Array(n).keys()].filter((i) => totals[i] < targets[i]);
    if (!cand.length) cand = [...Array(n).keys()];

    const exclusive = ["ビデオカメラ", "サウンドレコーダー", "フォトカメラ"];
    if (n == 3 && exclusive.includes(item)){
      let stricter = cand.filter(i => exclusive.every(ex => !assigned[i].includes(ex)));
      
      if (stricter.length){
        cand = stricter
      } else {
        const others = exclusive.filter(ex => ex !== item);
        cand = cand.filter(i => others.every(ex => !assigned[i].includes(ex)));
      }
    }

    const min = Math.min(...cand.map((i) => totals[i]));
    cand = cand.filter((i) => totals[i] === min);
    const idx = cand[(Math.random() * cand.length) | 0];

    assigned[idx].push(item);
    totals[idx]++;
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
