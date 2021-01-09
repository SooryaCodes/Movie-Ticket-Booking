var VipRow = document.getElementById("VipRow").value;
var VipSeat = document.getElementById("VipSeat").value;
var NormalRow = document.getElementById("NormalRow").value;
var NormalSeat = document.getElementById("NormalSeat").value;
var ExcecutiveRow = document.getElementById("ExcecutiveRow").value;
var ExcecutiveSeat = document.getElementById("ExcecutiveSeat").value;
var PremiumRow = document.getElementById("PremiumRow").value;
var PremiumSeat = document.getElementById("PremiumSeat").value;
var bookedSeats = document.getElementById("BookedSeats").value;
var TotalNumberOfSeat = parseInt(TotalNumberOfSeat)
var socket = io()

console.log(bookedSeats);
var Reserved = bookedSeats.split(",");
window.addEventListener('load', () => {
  if (Reserved.length === TotalNumberOfSeat) {
    alert('HouseFul')
    console.log('Houseful');
  }
})

window.addEventListener('load',()=>{
  var walletWrapper=document.querySelector('.wallet')

  if(Wallet<=0){
    walletWrapper.remove()
  }
})
window.addEventListener("load", function () {
  for (var i = 0; i < Reserved.length; i++) {
    document.getElementById(Reserved[i]).parentNode.classList.add("Reserved-Seat");
    document.getElementById(Reserved[i]).classList.add("Reserved");
    var reservedS = document.querySelectorAll(".Reserved");
    reservedS.forEach((value) => {
      value.disabled = true;
    });
  }
});
console.log(Reserved, "rese");
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
  var reservedS = document.querySelectorAll(".Reserved");
  reservedS.forEach((value) => {
    value.disabled = true;
    value.checked = false;
  });
  var input = document.querySelector(`#${hi}`);

  var checkedSeat = document.querySelectorAll('input[name="seat"]:checked');
  var unselected = document.querySelectorAll(
    'input[name="seat"]:not(:checked)'
  );
  var AllSeat = document.querySelectorAll('input[name="seat"]');

  if (checkedSeat.length > 10) {
    input.checked = false;
    unselected.forEach((value) => (value.disabled = true));
    var name = document.getElementById("username").value;
    console.log(name);
    document.querySelector(
      ".alerts"
    ).innerHTML += `<div class="alert style="position:fixed;" alert-dismissible fade show" role="alert" style="background:#464d75; color:white;box-shadow:0px 0px 20px #222538">
    <strong>Hi ${name}.</strong> Reached The Limit! You Can't Select Seat Any More..
  </div>`;
  } else if (checkedSeat.length <= 10) {
    unselected.forEach((value) => (value.disabled = false));

    var wrapper = document.querySelector(".seat-show-wrapper");
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

  var seat = [];
  var Vip = [];
  var Premium = [];
  var Excecutive = [];
  var Normal = [];

  var normalSeatget = document.querySelectorAll(
    'input[class="normal"]:checked'
  );
  for (var i = 0; i < normalSeatget.length; i++) {
    Normal[i] = normalSeatget[i].value;
  }
  for (var i = 0; i < checkedSeat.length; i++) {
    seat[i] = checkedSeat[i].value;
  }
  // for (var i = 0; i < normalSeat.length; i++) {
  //   seat[i] = normalSeat[i].value;
  // }

  //vip
  for (var i = 0; i < seat.length; i++) {
    if (seat[i].includes("Vip")) Vip.push(seat[i]);
  }

  //Premium
  for (var i = 0; i < seat.length; i++) {
    if (seat[i].includes("Premium")) Premium.push(seat[i]);
  }

  //vip
  for (var i = 0; i < seat.length; i++) {
    if (seat[i].includes("Excecutive")) Excecutive.push(seat[i]);
  }

  console.log(Vip, Premium, Excecutive, Normal);

  var VipPrice = Vip.length * show.Vip;
  var NormalPrice = Normal.length * show.Normal;
  var ExcecutivePrice = Excecutive.length * show.Excecutive;
  var PremiumPrice = Premium.length * show.Premium;

  var TotalPrice = VipPrice + ExcecutivePrice + NormalPrice + PremiumPrice;

  console.log(TotalPrice);

  document.getElementById("total").innerText = `Total : ₹ ${TotalPrice}`;

  var btn = document.getElementById("checkout");
  btn.addEventListener("click", function () {
    var seatNumber = checkedSeat.length;
    var paymentPopup = document.querySelector(".payment-popup");
    var totalAmount = (document.getElementById(
      "totalAmount"
    ).innerHTML = `₹<span id="totalPriceForPayment">${TotalPrice}</span> `);
    var screenName = (document.getElementById(
      "screenName"
    ).innerText = `${show.screenName}`);
    var seatNo = (document.getElementById(
      "seatNo"
    ).innerText = `${seatNumber}`);
    paymentPopup.classList.toggle("active");
  });
}

function wallet(val) {
  var walletInput = document.getElementById('Wallet');
  var total = parseInt(document.getElementById("totalPriceForPayment").innerText)
  var val = parseInt(val)
  console.log(val,total);
  if (walletInput.checked === true) {
    document.getElementById("totalPriceForPayment").innerHTML = total - val;
  } else {

    document.getElementById("totalPriceForPayment").innerHTML = total + val;
  }

}
function payment(paymentMethod) {
  var checkedSeat = document.querySelectorAll('input[name="seat"]:checked');
  var seat = [];
  for (var i = 0; i < checkedSeat.length; i++) {
    seat[i] = checkedSeat[i].value;
  }

  var total = parseInt(
    document.getElementById("totalPriceForPayment").innerText
  );


  var walletUsed;  

  var walletInput = document.getElementById('Wallet');
 if(walletInput){

   if (walletInput.checked === true) {
     walletUsed = true
    } else {
      walletUsed = false
    }
  }

  $.ajax({
    url: "/ticket-booking",
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      paymentMethod,
      total,
      seat,
      ownerId: ownerId,
      show,
      walletUsed
    }),
    success: (response) => {
      if (response.status === false) {
        alert("failed");
      } else if (response.Razorpay === true) {
        razorpayPayment(response);
        console.log(response, "response");
        // alert('success')
      } else {
        var bookingDetails = {
          message: 'New Booking Confirmed',
          ownerId: ownerId
        }
        socket.emit('booking', bookingDetails)
        location.href = response;
      }
    },
  });
}


const razorpayPayment = (data) => {
  console.log(data, "data in razorpay");
  var options = {
    key: "rzp_test_kX6azReFALaRXo", // Enter the Key ID generated from the Dashboard
    amount: data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Movie Cafe",
    description: "Ticket Booking",
    image: "",
    order_id: data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {

      verifyPayment(response, data);
    },
    prefill: {
      name: `${userName}`,
      email: `${userEmail}`,
      contact: `${userMobile}`
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#4B6591",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.on("payment.failed", function (response) {
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
  });
  setTimeout(function () {
    razorpayUp();
  }, 1000);

  function razorpayUp() {
    rzp1.open();
  }
};
function verifyPayment(payment, order) {
  console.log(payment,'payment');
  console.log(order,'order');
  $.ajax({
    url: "/verify-payment",
    method: "post",
    data: {
      payment,
      order,
    },
    success: (response) => {
      // bookSuccess();
      
      if(response.status===true){

        var bookingDetails = {
          message: 'New Booking Confirmed',
          ownerId: ownerId
        }
        socket.emit('booking', bookingDetails)
        location.href = "/booking-success?id="+order.receipt;
      }else{
        
        location.href = "/booking-failure?id="+order.receipt;
      }
    },
  });
}



const bookSuccess = () => {
  var success = document.querySelector(".success");
  success.classList.toggle("active");
};

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
<input value="${Normal.NRowName}-${j}" onclick="myfun(value)" name="seat"  class="normal"  type="checkbox" id="${Normal.NRowName}-${j}">
                <label for="${Normal.NRowName}-${j}"></label>
            </div>
            `;
  }
  NContainer.appendChild(row);
}

let VContainer = document.querySelector(".VContainer");
var row = Vip.Row;
var column = Vip.Seat;
for (let i = 1; i <= row; i++) {
  let row = document.createElement("main");
  for (let j = 1; j <= column; j++) {
    Vip.VRowName = "Vip-" + NRowName[i - 1];

    row.innerHTML += ` 
            <div class="seat">
             <input value="${Vip.VRowName}-${j}" name="seat"  onclick="myfun(value)" class="${Vip.VRowName}-${j}" id="${Vip.VRowName}-${j}" type="checkbox">
                <label for="${Vip.VRowName}-${j}"></label>
            </div>
            `;
  }
  VContainer.appendChild(row);
}
let EContainer = document.querySelector(".EContainer");
var row = Excecutive.Row;
var column = Excecutive.Seat;
for (let i = 1; i <= row; i++) {
  let row = document.createElement("main");
  for (let j = 1; j <= column; j++) {
    Excecutive.ERowName = "Excecutive-" + NRowName[i - 1];

    row.innerHTML += `
                        <div class="seat">
             <input value="${Excecutive.ERowName}-${j}" name="seat" onclick="myfun(value)" class="${Excecutive.ERowName}-${j}" id="${Excecutive.ERowName}-${j}" type="checkbox">
                <label for="${Excecutive.ERowName}-${j}"></label>
            </div>`;
  }
  EContainer.appendChild(row);
}

let PContainer = document.querySelector(".PContainer");
var row = Premium.Row;
var column = Premium.Seat;
for (let i = 1; i <= row; i++) {
  let row = document.createElement("main");
  for (let j = 1; j <= column; j++) {
    Premium.PRowName = "Premium-" + NRowName[i - 1];
    row.innerHTML += ` 
             <div class="seat">
            <input value="${Premium.PRowName}-${j}" name="seat" onclick="myfun(value)"  class="${Premium.PRowName}-${j}" type="checkbox" id="${Premium.PRowName}-${j}">
                <label for="${Premium.PRowName}-${j}"></label>
            </div>
            `;
  }

  PContainer.appendChild(row);
}









