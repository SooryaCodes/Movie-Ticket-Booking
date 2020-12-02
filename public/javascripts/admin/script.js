
// ---profile pop up  script---

function profileToggle() {
  const toggleProfile = document.querySelector(".nav-profile-pop-up");
  toggleProfile.classList.toggle("active");
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
