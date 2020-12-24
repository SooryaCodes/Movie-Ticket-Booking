var VipRow = document.getElementById("VipRow").value;
var VipSeat = document.getElementById("VipSeat").value;
var NormalRow = document.getElementById("NormalRow").value;
var NormalSeat = document.getElementById("NormalSeat").value;
var ExcecutiveRow = document.getElementById("ExcecutiveRow").value;
var ExcecutiveSeat = document.getElementById("ExcecutiveSeat").value;
var PremiumRow = document.getElementById("PremiumRow").value;
var PremiumSeat = document.getElementById("PremiumSeat").value;

var Vip = {
  Row: VipRow,
  Seat: VipSeat,
};
var Normal = {
  Row: NormalRow,
  Seat: NormalSeat,
};
var Excecutive = {
  Row: ExcecutiveRow,
  Seat: ExcecutiveSeat,
};
var Premium = {
  Row: PremiumRow,
  Seat: PremiumSeat,
};

console.log(Vip, Excecutive, Premium, Normal);

//---normal seat---

function myfun(hi) {
  var checkedSeat = document.querySelectorAll('input[name="seat"]:checked');
  var unselected = document.querySelectorAll('input[name="seat"]:not(:checked)');
  var AllSeat = document.querySelectorAll('input[name="seat"]');

  if (checkedSeat.length > 10) {
    unselected.forEach((value) => (value.disabled = true));
    var name=document.getElementById('username').value
    console.log(name);
    document.querySelector(
      ".alerts"
    ).innerHTML += `<div class="alert  alert-dismissible fade show" role="alert" style="background:#464d75; color:white;box-shadow:0px 0px 20px #222538">
    <strong>Hi ${name}.</strong> Reached The Limit! You Can't Select Seat Any More..
  </div>`;
  } else if(checkedSeat.length <= 10){
    unselected.forEach((value) => (value.disabled = false));

    var wrapper = document.querySelector(".seat-show-wrapper");
    var input = document.querySelector(`.${hi}`);
    if (input.checked === true) {
      wrapper.innerHTML += `
    <div class="seat-show ${hi + hi}" >
    ${hi}
    </div>
`;
    } else {
      var removeAlert = document.querySelector(`.${hi + hi}`);
      removeAlert.remove();
    }

    console.log(wrapper.childElementCount);
    if (wrapper.childElementCount > 1) {
      wrapper.classList.add("active");
    } else {
      wrapper.classList.remove("active");
      console.log("hi there is nothing");
    }
  }
}

var NRowName = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
let NContainer = document.querySelector(".NContainer");
var row = Normal.Row;
var column = Normal.Seat;
for (let i = 1; i <= row; i++) {
  let row = document.createElement("main");
  for (let j = 1; j <= column; j++) {
    Normal.NRowName = NRowName[i - 1];

    row.innerHTML += `
            <div class="seat">
<input value="${Normal.NRowName}-${j}" onclick="myfun(value)" name="seat"  class="${Normal.NRowName}-${j}"  type="checkbox" id="${Normal.NRowName}-${j}">
                <label for="${Normal.NRowName}-${j}"></label>
            </div>
            `;
  }
  NContainer.appendChild(row);
}

//---vip-seat---

var VRowName = [
  "Vip-A",
  "Vip-B",
  "Vip-C",
  "Vip-D",
  "Vip-E",
  "Vip-F",
  "Vip-G",
  "Vip-H",
  "Vip-I",
  "Vip-J",
  "Vip-K",
  "Vip-L",
  "Vip-M",
  "Vip-N",
  "Vip-O",
  "Vip-P",
  "Vip-Q",
  "Vip-R",
  "Vip-S",
  "Vip-T",
  "Vip-U",
  "Vip-V",
  "Vip-W",
  "Vip-X",
  "Vip-Y",
  "Vip-Z",
];

let VContainer = document.querySelector(".VContainer");
var row = Vip.Row;
var column = Vip.Seat;
for (let i = 1; i <= row; i++) {
  let row = document.createElement("main");
  for (let j = 1; j <= column; j++) {
    Vip.VRowName = VRowName[i - 1];

    row.innerHTML += ` 
            <div class="seat">
             <input value="${Vip.VRowName}-${j}" name="seat"  onclick="myfun(value)" class="${Vip.VRowName}-${j}" id="${Vip.VRowName}-${j}" type="checkbox">
                <label for="${Vip.VRowName}-${j}"></label>
            </div>
            `;
  }
  VContainer.appendChild(row);
}

//---excecutive-seat---

var ERowName = [
  "Excecutive-A",
  "Excecutive-B",
  "Excecutive-C",
  "Excecutive-D",
  "Excecutive-E",
  "Excecutive-F",
  "Excecutive-G",
  "Excecutive-H",
  "Excecutive-I",
  "Excecutive-J",
  "Excecutive-K",
  "Excecutive-L",
  "Excecutive-M",
  "Excecutive-N",
  "Excecutive-O",
  "Excecutive-P",
  "Excecutive-Q",
  "Excecutive-R",
  "Excecutive-S",
  "Excecutive-T",
  "Excecutive-U",
  "Excecutive-V",
  "Excecutive-W",
  "Excecutive-X",
  "Excecutive-Y",
  "Excecutive-Z",
];

let EContainer = document.querySelector(".EContainer");
var row = Excecutive.Row;
var column = Excecutive.Seat;
for (let i = 1; i <= row; i++) {
  let row = document.createElement("main");
  for (let j = 1; j <= column; j++) {
    Excecutive.ERowName = ERowName[i - 1];

    row.innerHTML += `
                        <div class="seat">
             <input value="${Excecutive.ERowName}-${j}" name="seat" onclick="myfun(value)" class="${Excecutive.ERowName}-${j}" id="${Excecutive.ERowName}-${j}" type="checkbox">
                <label for="${Excecutive.ERowName}-${j}"></label>
            </div>`;
  }
  EContainer.appendChild(row);
}

//---vip-seat---

var PRowName = [
  "Premium-A",
  "Premium-B",
  "Premium-C",
  "Premium-D",
  "Premium-E",
  "Premium-F",
  "Premium-G",
  "Premium-H",
  "Premium-I",
  "Premium-J",
  "Premium-K",
  "Premium-L",
  "Premium-M",
  "Premium-N",
  "Premium-O",
  "Premium-P",
  "Premium-Q",
  "Premium-R",
  "Premium-S",
  "Premium-T",
  "Premium-U",
  "Premium-V",
  "Premium-W",
  "Premium-X",
  "Premium-Y",
  "Premium-Z",
];

let PContainer = document.querySelector(".PContainer");
var row = Premium.Row;
var column = Premium.Seat;
for (let i = 1; i <= row; i++) {
  let row = document.createElement("main");
  for (let j = 1; j <= column; j++) {
    Premium.PRowName = PRowName[i - 1];
    row.innerHTML += ` 
             <div class="seat">
            <input value="${Premium.PRowName}-${j}" name="seat" onclick="myfun(value)"  class="${Premium.PRowName}-${j}" type="checkbox" id="${Premium.PRowName}-${j}">
                <label for="${Premium.PRowName}-${j}"></label>
            </div>
            `;
  }
  PContainer.appendChild(row);
}
