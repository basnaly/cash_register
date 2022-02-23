
const ITEMS = [
  {name: "coffee", price: 8.36, img: "img/coffee.jpg"},
  {name: "cola", price: 4.12, img: "img/cola.jpeg"},
  {name: "evian", price: 2.57, img: "img/evian.jpeg"},
  {name: "frey", price: 11.98, img: "img/frey.jpg"},
  {name: "godiva", price: 10.23, img: "img/godiva.jpeg"},
  {name: "lays", price: 5.19, img: "img/lays.png"},
  {name: "orbit", price: 3.26, img: "img/orbit.jpeg"},
  {name: "pringles", price: 9.54, img: "img/pringles.jpeg"},
  {name: "tea", price: 7.83, img: "img/tea.jpeg"},
]

const CURRENCY = {
  "ONE HUNDRED": 100,
  "TWENTY": 20,
  "TEN": 10,
  "FIVE": 5,
  "ONE": 1,
  "QUARTER": 0.25,
  "DIME": 0.1,
  "NICKEL": 0.05,
  "PENNY": 0.01,  
};

let cid = [
  ["PENNY", 1.01],
  ["NICKEL", 2.05],
  ["DIME", 3.1],
  ["QUARTER", 4.25],
  ["ONE", 90],
  ["FIVE", 55],
  ["TEN", 20],
  ["TWENTY", 60],
  ["ONE HUNDRED", 100]
];

let selectedItemPrice = 0;

$(function(){
  $(".right-box").html(ITEMS.map((el, i) => createCard(el)));
  drawCid();
});

const createCard = (item) => {
  let divCard = $("<div></div>").addClass("div-card shadow")
                .on("click", onClickItem).attr("price", item.price);
  let itemImg = $("<img/>").attr("src", item.img);
  let divPrice = $("<div></div>").html(item.price).addClass("price");
  divCard.html([itemImg, divPrice]);
  return divCard;
}

const drawCid = () =>{
  let tableCid = $("table").html("");
  let tr = $("<tr></tr>");
    let th1 = $("<th></th>").html("Cash-in-draw").attr("colspan", "2");
    let sumCid = +(cid.reduce((acc, curr) => acc + curr[1], 0)).toFixed(2);
    let th2 = $("<th></th>").html(sumCid).attr("colspan", "2");
    $(tr).append([th1, th2]);
    $(tableCid).append(tr);

    if (sumCid === 0) {
      $(".submit-button").addClass("btn-danger disabled").html("Closed");
    }

    tr = $("<tr></tr>");
    th1 = $("<th></th>").html("Currency");
    th2 = $("<th></th>").html("Amount");
    let th3 = $("<th></th>").html("Q-ty");
    let th4 = $("<th></th>").html("Total");
    $(tr).append([th1, th2, th3, th4]);
    $(tableCid).append(tr);

  for (let key of cid) {
    let tr = $("<tr></tr>");
    let td1 = $("<td></td>").html(key[0].toLowerCase());
    let td2 = $("<td></td>").html(CURRENCY[key[0]]);
    let qty = Math.round(key[1] / CURRENCY[key[0]]);
    let td3 = $("<td></td>").html(qty);
    let td4 = $("<td></td>").html(key[1]);
    $(tr).append([td1, td2, td3, td4]);
    $(tableCid).append(tr);
  }
}

const onClickItem = (item) => {
  $(".div-card").removeClass("selected");
  $(item.currentTarget).addClass("selected");
  selectedItemPrice = +$(item.currentTarget).attr("price");
  $("#price").html(selectedItemPrice);
}

const calcCash = (cash) => {
  let cashObj = {};
  for (let key in CURRENCY) {
    let count = Math.floor(cash / CURRENCY[key]);
    if (count > 0) {
      cash = cash - count * CURRENCY[key];
      cashObj[key] = count * CURRENCY[key];
    } 
  }
  return cashObj;
}

const submit = () => {
  let cash = +$("#input").val();
  if (cash < selectedItemPrice) {
    alert("Please give enough money!");
    return;
  }
  let cashGiven = calcCash(cash);
  let result = checkCashRegister(selectedItemPrice, cash, cid, cashGiven);
  setTimeout( () => $("#input").val(""), 1000);

  if (result.status === "INSUFFICIENT_FUNDS"){
    $(".submit-button").addClass("btn-danger disabled").html("Closed");
    $(".change").html(`Your change is ${cash}`);
  }
  else {
    $(".change").html(`Your change is ${+(cash - selectedItemPrice).toFixed(2)}`);
    drawCid();
  }
}

function checkCashRegister(price, cash, cid, cashGiven) {
  let change = [];
  let remChange = cash - price;
  
  let initialCash = cid.reduce((acc, curr) => acc + curr[1], 0);
  
  if (initialCash === remChange) {
    return {status: "CLOSED", change: cid}
  }
  
  for (let i = cid.length - 1; i >= 0; i--) {
    let [curr, amount] = cid[i];
    let addedCash = cashGiven[curr] ?? 0;
    let value = CURRENCY[curr]; 

    if (value <= remChange) {
      let requiredCount = Math.floor(remChange / value); 
      let availableCount = Math.round(amount / value); 

      let currChange = +((Math.min(requiredCount, availableCount) * value).toFixed(2));
      remChange = +(remChange - currChange).toFixed(2);
      
      cid[i][1] = +(cid[i][1] - currChange).toFixed(2); 
      change.push([curr, currChange]);
    }
    cid[i][1] = +(cid[i][1] + addedCash).toFixed(2);
  }
  
  if (remChange > 0){
      return {status: "INSUFFICIENT_FUNDS", change: []}
  }
  return {status: "OPEN", change}
}

