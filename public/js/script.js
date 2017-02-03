function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

$(function(){
  $('#login-email').focus();
  $('#reg-email').focus();
  $('.add-form').on('click',function(e){
    e.preventDefault();
    var form = $(this);
    $.ajax({
      method: form.attr('method'),
      url: form.attr('action'),
      data: form.serialize()
    }).done(function(){
      form.parent().parent().fadeOut();
    })
  })

  $('.remove-form').on('click',function(e){
    e.preventDefault();
    var form = $(this);
    $.ajax({
      method: form.attr('method'),
      url: form.attr('action'),
      data: form.serialize()
    }).done(function(){
      form.parent().parent().fadeOut();
      $('.checkin-button').each(function(){
        $(this).removeClass('hidden');
      })
    })
  })

  if (window.sessionStorage.coords) {
    var coords = JSON.parse(window.sessionStorage.coords),
        text = '';
    $('.distance-placeholder').each(function() {
      var dist = parseFloat(distance($(this).data('lat'),$(this).data('lng'),coords.lat,coords.lng)).toFixed(1);
      text = dist + ' miles';
      $(this).text(text);
    })
  }

  $('.checkin-list').on('click',function(e) {
    e.preventDefault();
    var href = $(this).attr('href');
    $.ajax({
      type: 'GET',
      url: href,
      success: function(data) {
        console.log(data);
      },
      error: function(data) {
        console.log('error',data);
      }
    })
  })


})

var mapDiscreet = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"on"},{"color":"#716464"},{"weight":"0.01"}]},{"featureType":"administrative.country","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape.natural.landcover","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"visibility":"simplified"}]},{"featureType":"poi.attraction","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"simplified"},{"color":"#a05519"},{"saturation":"-13"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#84afa3"},{"lightness":52}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"}]}]

//Map on show.ejs
function parksMap(){
  $(function(){
    var newCityCoor = $('.latlong').eq(0).val().split(',');
    var newCityLat = parseFloat(newCityCoor[0]);
    var newCityLong = parseFloat(newCityCoor[1]);
    function initialize() {
      var infowindow = new google.maps.InfoWindow();
      var mapCanvas = document.getElementById('map-canvas');
      var mapOptions = {
        scrollwheel: false,
        center: new google.maps.LatLng(newCityLat,newCityLong),
        zoom: 13,
        styles: mapDiscreet
      }
      var map = new google.maps.Map(mapCanvas, mapOptions)
      $('.latlong').each(function(){
        var coor = $(this).val().split(','),
            parkLat = parseFloat(coor[0]),
            parkLong = parseFloat(coor[1]),
            icon = {
              url: './../images/dog-park-15-152-260714.png',
              size: new google.maps.Size(30, 30),
              scaledSize: new google.maps.Size(30, 30)
            };
        if ($(this).hasClass('favorite')) {
          icon = {
            url: './../images/orange_star.png',
            size: new google.maps.Size(35, 35),
            scaledSize: new google.maps.Size(35, 35)
          };
        };  
        var marker = new google.maps.Marker({
          position: {lat: parkLat, lng: parkLong},
          icon: icon
        });
        var parkName = $(this).siblings().eq(0).text(),
            directions = $(this).siblings().eq(1).html(),
            distance = $(this).parent().siblings().eq(0).children().eq(0).text().trim(),
            infowindow = new google.maps.InfoWindow({
              content: "<div class='info-window'><p class='name'>" + parkName + "</p><p class='distance'>" + distance + "</p><p class='directions'>" + directions + "</p></div>"
            });
        var location = $(this).parent().parent();

        location.hover(function() {
          google.maps.event.trigger(marker, 'click');
        });
            
        location.click(function() {
          map.setCenter(marker.getPosition());
        });
        
        google.maps.event.addListener(marker, 'click', function() {
          if (openWindow) {
            openWindow.close();
          }
          openWindow = infowindow;
          infowindow.open(map,marker);
        })

        marker.setMap(map);

      })
    }
    google.maps.event.addDomListener(window, 'load', initialize);
  })
}

var openWindow = false;

parksMap();



