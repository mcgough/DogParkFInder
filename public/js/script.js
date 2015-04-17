$(function(){
  $('#main-input').focus();
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

//removes extra spaces in park list
  $('.park-name').each(function(){
    if($(this).text().length === 9){
      $(this).remove();
    }
  })

  $('.numDogs').each(function(){
    if($(this).text !== 'none'){
      $(this).css('color','green');
    }
  })

})


var mapDiscreet = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"on"},{"color":"#716464"},{"weight":"0.01"}]},{"featureType":"administrative.country","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape.natural.landcover","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"visibility":"simplified"}]},{"featureType":"poi.attraction","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"simplified"},{"color":"#a05519"},{"saturation":"-13"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#84afa3"},{"lightness":52}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"}]}]

function parksMap(){
  $(function(){
    var newCityCoor = $('.latlong').eq(0).val().split(',');
    var newCityLat = parseFloat(newCityCoor[0]);
    var newCityLong = parseFloat(newCityCoor[1]);
    function initialize() {
      var infowindow = new google.maps.InfoWindow();
      var mapCanvas = document.getElementById('map-canvas');
      var mapOptions = {
        center: new google.maps.LatLng(newCityLat,newCityLong),
        zoom: 12,
        styles: mapDiscreet,
        // mapTypeId: google.maps.MapTypeId.ROADMAP
        disableDefaultUI: true
      }
      var map = new google.maps.Map(mapCanvas, mapOptions)
      $('.latlong').each(function(){
        var coor = $(this).val().split(',');
        var parkLat = parseFloat(coor[0]);
        var parkLong = parseFloat(coor[1]);
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(parkLat,parkLong),
        });
        var infowindow = new google.maps.InfoWindow({
          content: $(this).siblings().text()
        });
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        })
        marker.setMap(map);
      })
    }
    google.maps.event.addDomListener(window, 'load', initialize);
  })
}

function userMap(markers){
  function initialize() {
    var mapOptions = {
      center: { lat: markers[0].lat, lng: markers[0].long},
      zoom: 12,
      styles: mapDiscreet,
      disableDefaultUI: true
    };
    var map = new google.maps.Map(document.getElementById('user-map'), mapOptions);
    markers.forEach(function(park){
      console.log(park.lat, park.long);
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(park.lat,park.long)
      });
    marker.setMap(map);
    })
  }
  google.maps.event.addDomListener(window, 'load', initialize);
}

function editList(array){
  $(function(){
    var tableNames = $('.park-name');
    tableNames.each(function(){
      for(var i = 0; i < array.length;i++){
        if(array[i] === $(this).text()){
          $(this).closest('tr ').remove();
        }
      }
    })
  })
}


