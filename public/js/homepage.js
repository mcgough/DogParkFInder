$(function() {
  var coords;
  if (!window.sessionStorage.coords) {
    if ("geolocation" in navigator) {
      if (!window.sessionStorage.geoCheck) {
        $(".geo-popup").addClass("visible");
      }
      coords = {};
      navigator.geolocation.getCurrentPosition(function(pos) {
        $(".geo-popup").removeClass("visible");
        coords.lat = pos.coords.latitude;
        coords.lng = pos.coords.longitude;
        window.sessionStorage.setItem("coords", JSON.stringify(coords));
        $(".geo-input").val(JSON.stringify(coords));
        $(".geo-form").removeClass("hidden");
      });
      window.sessionStorage.setItem("geoCheck", "true");
    } else {
      window.sessionStorage.setItem("geoCheck", "true");
      alert("Your browser does not allow geolocation");
    }
  } else {
    coords = window.sessionStorage.getItem("coords");
    $(".geo-input").val(coords);
    $(".geo-form").removeClass("hidden");
  }

  $(".my-close").on("click", function() {
    $(".geo-popup").removeClass("visible");
  });
  $(".copy .btn").on("click", function() {
    $(".geo-popup").removeClass("visible");
  });
});
