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

//index.ejs script
function indexJs(){
  //compares users fav's to checkins, if there only checked in park and checkout button are shown
  checkins = {};
  for(var i = 0; i < checks.length; i++){
   if(checks[i].userid === user.id){
    for(var j = 0; j < dogRuns.length;j++){
      if(checks[i].parkid === dogRuns[j].id){
        console.log('here', dogRuns[j].name);
        $('.park-name').each(function(){
          if($(this).text() === dogRuns[j].name){
            console.log('yes',$(this))
            // $(this).parent().parent().children().eq(4);
            $(this).parent().parent().siblings().hide();
            // console.log($(this).parent().parent().children().eq(3));
            $(this).parent().parent().children().eq(2).addClass('hidden');
            $(this).parent().parent().children($('.checkout-button').removeClass('hidden'));
            $(this).parent().parent().children($('.remove-button').addClass('hidden'))
          }else{
            console.log('no')
          }
        })

      }
    }
   }
  }

  //creates an array of checkins at parks
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

  //checks how long ago checkins occurred and stores only those less than 1 hour old in an object
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
  //display validCheckins on DOM and their count
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
              // console.log(key,'===',$(this).text(),'match!!!!!!!',currentValidCheckins[key].length);
              $('.numDogs .number').eq(count).text(currentValidCheckins[key].length);
            }
            count++;
          })
        }
      }
    })
  }
  setPageDogCount(validCheckInFinder(getCheckInTimes(parks,checks)))
}

function dogListPage() {
  //checking if checkin occurred within the last 60 mins, if did pushs time diff to min array and creates key-value pair in validchins object//
  mins = []
  var currentTimeMin = (new Date().getTime() / 1000 / 3600 * 60);
  var validCheckIns = {} //object where valid checkin times and userId are stored
  for(var key in checkins){
    console.log('!!!!!!!',Date.parse(checkins[key]) / 1000 / 3600 * 60)
    if(currentTimeMin - (Date.parse(checkins[key])) / 1000 / 3600 * 60 <= 60){
      if(!validCheckIns[key]){
        console.log('here')
        validCheckIns[key] = checkins[key];
        mins.push(Math.floor(currentTimeMin - (Date.parse(checkins[key])) / 1000 / 3600 * 60))
      }else{
        validCheckins[key].push(key);
      }
    }
  }
  console.log(mins)
  //finding users from keys in validCheckIns object and storing in validCheckedUsers array, eventually want to be dog name
  var validCheckedUsers = []
  for(var user in owners){
    for(var id in validCheckIns){
      if (user === id){
        var xuser = owners
        console.log(xuser)
        var checkIn = validCheckIns[id]
        console.log(checkIn)
        validCheckedUsers.push(owners[user])
      }
    }
  }

  $(function(){
    validCheckedUsers.forEach(function(user,idx){
      $('.checkedIn-list').append("<li class='" + user + " checkedIn-dogs'>" + user + " <small class='mins-fix'>(" + mins[idx] + " mins ago)</small></li>")
    })
  })
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


