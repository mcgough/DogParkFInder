$(function() {
	if(!window.localStorage.coords) {
	  if ("geolocation" in navigator) {
			$('.geo-popup').addClass('visible');
	  	var coords = {};
	    navigator.geolocation.getCurrentPosition(function(pos) {
	    	$('.geo-popup').removeClass('visible');
	      coords.lat = pos.coords.latitude;
	      coords.lng = pos.coords.longitude;
	      window.localStorage.setItem('coords',JSON.stringify(coords));
	      $('.geo-input').val(JSON.stringify(coords));
	      $('.geo-form').removeClass('hidden');
	    });
	  } else {
	    alert('Your browser does not allow geolocation');
	  }
	} else {
		var coords = window.localStorage.getItem('coords');
	 	$('.geo-input').val(coords);
	 	$('.geo-form').removeClass('hidden');
	}

	$('.my-close').on('click', function() {
		$('.geo-popup').removeClass('visible');
	})
	$('.copy .btn').on('click', function() {
		$('.geo-popup').removeClass('visible');
	})

});
		

		