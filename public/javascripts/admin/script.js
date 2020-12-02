// ---chart script---

var ctxL = document.getElementById("barChart").getContext("2d");
var gradientFill = ctxL.createLinearGradient(0, 0, 0, 290);
gradientFill.addColorStop(0, "#5e97ff");
gradientFill.addColorStop(1, "rgba(0,146,255,0.1)");
var myLineChart = new Chart(ctxL, {
  type: "bar",
  data: {
    labels: ["March", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        data: [30, 65, 45, 65, 35, 65, 0],
        backgroundColor: gradientFill,
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
  },
});

var ctxL = document.getElementById("lineChart").getContext("2d");
var gradientFill = ctxL.createLinearGradient(0, 0, 0, 290);
gradientFill.addColorStop(0, "rgba(173, 53, 186, 1)");
gradientFill.addColorStop(1, "rgba(173, 53, 186, 0.1)");
var myLineChart = new Chart(ctxL, {
  type: "line",
  data: {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        data: [0, 65, 45, 65, 35, 65, 0],
        backgroundColor: gradientFill,
        borderColor: ["#AD35BA"],
        borderWidth: 2,
        pointBorderColor: "#fff",
        pointBackgroundColor: "rgba(173, 53, 186, 0.1)",
      },
    ],
  },
  options: {
    responsive: true,
  },
});
// ---profile pop up  script---

function profileToggle() {
  const toggleProfile = document.querySelector(".nav-profile-pop-up");
  toggleProfile.classList.toggle("active");
}

// --- a active script---

const currentLocation = location.href;
const sidebar = document.querySelectorAll(".sidebar-items");
const foodLength = sidebar.length;
for (let i = 0; i < foodLength; i++) {
  if (sidebar[i].href === currentLocation) {
    sidebar[i].className = "sidebar-items s-active";
  }
}

// Tooltips Initialization
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});


//---generate password---

function getPassword() {
  var userName = document.getElementById("user").value;
  var chars = "12@345678910@12@34567@891012@34567@8910@";
  var passwordLength = 5;
  var password = "";

  for (var i = 0; i < passwordLength; i++) {
    var randomPassword = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomPassword, randomPassword + 1);
  }
  document.querySelector("#password").value = userName + password;
}
