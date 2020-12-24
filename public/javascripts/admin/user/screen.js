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
  var container = document.querySelector(".seat-show-wrapper");
  var swiperWrapper=document.querySelector('.swiper-wrapper')
  var input = document.querySelector(`.${hi}`);
  if (input.checked === true) {
    swiperWrapper.innerHTML += `
            <div class="swiper-slide">
            <div class="seat-show ${hi + hi}" >
  ${hi}
</div>
</div>
`;
  } else {
    var removeAlert = document.querySelector(`.${hi + hi}`);
    removeAlert.remove();
  }

  console.log(container.childElementCount);
  if (container.childElementCount > 1) {
    container.classList.add("active");
  } else {
    container.classList.remove("active");
    console.log("hi there is nothing");
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
<input value="${Normal.NRowName}-${j}" onclick="myfun(value)" name="${Normal.NRowName}-${j}"   class="${Normal.NRowName}-${j}"  type="checkbox" id="${Normal.NRowName}-${j}">
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
             <input value="${Vip.VRowName}-${j}" name="${Vip.VRowName}-${j}" onclick="myfun(value)" class="${Vip.VRowName}-${j}" id="${Vip.VRowName}-${j}" type="checkbox">
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
             <input value="${Excecutive.ERowName}-${j}" name="${Excecutive.ERowName}-${j}" onclick="myfun(value)" class="${Excecutive.ERowName}-${j}" id="${Excecutive.ERowName}-${j}" type="checkbox">
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
            <input value="${Premium.PRowName}-${j}" name="${Premium.PRowName}-${j}" onclick="myfun(value)"  class="${Premium.PRowName}-${j}" type="checkbox" id="${Premium.PRowName}-${j}">
                <label for="${Premium.PRowName}-${j}"></label>
            </div>
            `;
  }
  PContainer.appendChild(row);
}


var swiper = new Swiper(".swiper-container.seat-slider", {
  slidesPerView: 8,
  spaceBetween: 10,
  //   slidesPerGroup: 3,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    // 550:{
    //     slidesPerView:1,
    //     spaceBetween:10
    // },
    300: {
      slidesPerView: 3,
      spaceBetween: 0,
    },
    550: {
      slidesPerView: 4,
    },
    // when window width is >= 320px
    622: {
      slidesPerView: 5,
      spaceBetween: 0,
    },

    // when window width is >= 480px
    966: {
      slidesPerView: 4,
      spaceBetween: 0,
    },
    // when window width is >= 640px
    1382: {
      slidesPerView: 7,
      spaceBetween: 0,
    },
  },
});
