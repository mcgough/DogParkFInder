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

////index.ejs script
function indexJs(){
  checkins = {};
  for(var i = 0; i < checks.length; i++){
   if(checks[i].userid === user.id){
    for(var j = 0; j < dogRuns.length;j++){
      if(checks[i].parkid === dogRuns[j].id){
        console.log('here', dogRuns[j].name);
        $('.park-name').each(function(){
          if($(this).text() === dogRuns[j].name){
            // console.log('yes',$(this))
            console.log('!!!!',$(this).parent().parent().children().eq(4));
            $(this).parent().parent().siblings().hide();
            $(this).parent().parent().children().eq(3).addClass('hidden');
            $(this).parent().parent().children($('.checkout-button').removeClass('hidden'));
          }else{
            console.log('no')
          }
        })

      }
    }
   }
  }
  for(var i = 0; i < dogRuns.length;i++){
    for(var j = 0; j < checks.length;j++){
      if(dogRuns[i].id === checks[j].parkid){
        if(!checkins[dogRuns[i].name]){
          checkins[dogRuns[i].name] = [checks[j].time];
        }else{
          checkins[dogRuns[i].name].push(checks[j].time);
        }
      }
    }
  }
  var currentTimeMin = (new Date().getTime() / 1000 / 3600 * 60);
  var validCheckins = {};
  for(var key in checkins){
    checkins[key].forEach(function(time){
      if(currentTimeMin - (time / 1000 / 3600 * 60) <= 60){
        if(!validCheckins[key]){
          validCheckins[key] = [key];
        }else{
          validCheckins[key].push(key);
        }
      }
    })
  }
  $(function(){
    var header = $('.welcome');
    var parkName = $('.park-name').text();
    console.log('parkName',parkName);
    for(var key in validCheckins){
      if(parkName.indexOf(key) !== -1){
      $('.no-dogs').hide();
        console.log('key',key,validCheckins[key].length)
        var count = 0;
        $('.park-name').each(function(){
          if($(this).text().indexOf(key) !== -1){
            $('.numDogs').eq(count).text(validCheckins[key].length);
            // console.log($(this));
          }
          count++;
        })
      };
    }
  })
}

function showJs(){
  function favoriteDisplay(parks){
    $(function(){
      if(parks.length === 0) {
        $('.results').addClass('hidden');
        $('.error').removeClass('hidden');
        $('.show-title').addClass('hidden');
      }
    })
  }

  favoriteDisplay(venues);

  function getCheckInTimes(places,checkInData){
    checkins = {};
    for(var i = 0; i < parks.length;i++){
      for(var j = 0; j < checks.length;j++){
        if(parks[i].id === checks[j].parkid){
          if(!checkins[parks[i].name]){
            checkins[parks[i].name] = [checks[j].time];
          }else{
            checkins[parks[i].name].push(checks[j].time);
          }
        }
      }
    }
    return checkins;
  }

  // getCheckInTimes(parks,checks)


  // console.log('checkins',checkins);
  function validCheckInFinder(timesObject){
    var currentTimeMin = (new Date().getTime() / 1000 / 3600 * 60);
    var validCheckins = {};
    for(var key in timesObject){
      timesObject[key].forEach(function(time){
        if(currentTimeMin - (time / 1000 / 3600 * 60) <= 60){
          if(!validCheckins[key]){
            validCheckins[key] = [key];
          }else{
            validCheckins[key].push(key);
          }
        }
      })
    }
    return validCheckins;
  }

  // validCheckInFinder(getCheckInTimes(park,checks));


  // console.log(validCheckins);
  function setPageDogCount(currentValidCheckins){
    $(function(){
      var header = $('.welcome');
      var parkName = $('.park-name').text();
      for(var key in currentValidCheckins){
        if(parkName.indexOf(key) !== -1){
          var count = 0;
          $('.park-name').each(function(){
            if($(this).text() === key){
              console.log(key,'===',$(this).text(),'match!!!!!!!',currentValidCheckins[key].length);
              $('.numDogs').eq(count).text(currentValidCheckins[key].length);
            }
            count++;
          })
        }
      }
    })
  }
  setPageDogCount(validCheckInFinder(getCheckInTimes(parks,checks)))
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


