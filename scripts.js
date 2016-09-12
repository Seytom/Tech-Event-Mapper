
      var geocoder;
      var map;
      var i;
      var city;
      var coords = [];
      var mu_results=[];

      $(document).ready(function(){


          //initial display of Seattle map/info on page load
          $.get(
            $('#mu_form').attr('action'), 

            function(data){
              coords = [47.6197, -122.3331]
              mu_results = data['results'];
              google.maps.event.addDomListener(window, 'load', initialize(coords));
              makeTable();
           }, 'json');
           
           //provides Mountain View map/info on demand
          $('#search_form').submit(function(){              
              $.get(
                $(this).attr('action'),
                $(this).serialize(),

                function(data){
                  mu_results = data['results'];
                  coords = [37.3894,-122.0819];
                  initialize(coords);
                  makeTable();
                },
                "json"
              );
              return false;            
            });

          //provides Seattle map/info on demand
          $('#mu_form').submit(function(){              
              
              $.get(
                $(this).attr('action'),
                $(this).serialize(),

                function(data){
                  mu_results = data['results'];
                  coords = [47.6197, -122.3331];
                  initialize(coords);
                  makeTable();
                },
                "json"
              );
              return false;            
            });
          
          $('#city_form').submit(function(){
            var x = document.getElementById("city_form");
            var txt = x.elements[0].value;
            var location = codeAddress(txt);
         
            return false; 
            });     

            //toggles the map to display Seattle Tech Calendar
          $( "#click_me" ).click(function() {
              $('.container').toggle( "slow", function(){
              });
            });    


    function initialize(loc_array) { //This function initializes the Google Map
      var mapOptions = {
        center: new google.maps.LatLng(loc_array[0], loc_array[1]), 
        zoom: 11
      }
      map = new google.maps.Map(document.getElementById("map-canvas"),
          mapOptions);

      var contentString = [];//arrays for adding info windows to markers
      var contentString2 = [];
      var infowindow = [];
      var marker = [];     
      
      for (i in mu_results) //Loop for attaching colored markers based on time to event
      {      
        if (typeof mu_results[i]['venue'] != 'undefined') // avoid errors caused by undefined venue values
        {        
          contentString[i] = mu_results[i]['description'];
          contentString2[i] = mu_results[i]['name'];
            
          var d = new Date();
          var time_now = d.getTime();
          var event_time = mu_results[i]['time'];
          var dateTime = new Date(mu_results[i]['time']);
          var string = dateTime.toString();
          var date = string.substring(0,15);
          
          if  ((event_time - time_now) < 216400000)
              var image = 'assets/images/red_MarkerM.png';
          else if  ((event_time - time_now) < 604800000)
              var image = 'assets/images/green_MarkerM.png';
          else if ((event_time - time_now) < 1200000000)
              var image = 'assets/images/brown_MarkerM.png';
          else
              var image = 'assets/images/paleblue_MarkerM.png';

          var my_lat_long = new google.maps.LatLng(mu_results[i]['venue']['lat'],mu_results[i]['venue']['lon']);

          infowindow[i] = new google.maps.InfoWindow({
            content: date + "<br>" + "  " + contentString2[i] + contentString[i],
            position: my_lat_long
           }); 
          marker[i] = new google.maps.Marker({
              map: map,
              position: my_lat_long,
              icon: image
          });

          google.maps.event.addListener(marker[i], 'click', function() {          
            var a = 0;

            for (var i in infowindow)
              {
                if (infowindow[i].position === this.position){
                    a = i;
                  }
              }
            infowindow[a].open(map,this);            
          });
        }        
      };
    }
 
    function codeAddress(address) 
    { //This function makes a map based on the city name entered by user
        geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': address}, function(results, status) {
              map.setCenter(results[0].geometry.location);
              var x = document.getElementById("city_form");
              var txt = x.elements[0].value;
              var txt1 = x.elements[1].value;
              var txt2 = x.elements[2].value;
              
              $.get(
                txt1+"lon="+ results[0].geometry.location.lng() + "&lat=" + results[0].geometry.location.lat()+ "&"+txt2,
                function(data){                
                mu_results = data['results'];
                coords = [results[0].geometry.location.lat(),results[0].geometry.location.lng()];
                initialize(coords);
                makeTable();
              },
              "json"
            );
            return false;          
        });
       return false;
    }
    
    function makeTable() 
    {  //This function makes a table of events based on the call to Meetup.com
      $("#tbody").html(" ");  //Clears out data from earlier table, if any
      // console.table(mu_results);
      var events=0;
      for (i in mu_results) 
      {          
        var price = 0;
        var dateTime = new Date(mu_results[i]['time']);
        var string = dateTime.toString();
        var date = string.substring(0,15);
        var time = string.substring(16,21) + " PST";
        var fields = [date, time, 'name', price, 'event_url', 'address_1', 'city'];//This array saves 3 lines of code at the end of the for loop below

        if (typeof mu_results[i]['venue'] == 'undefined'){//these if statements avoid 'undefined' errors while making table
          mu_results[i]['venue'] = [];
          mu_results[i]['venue']['address_1'] = 'Not provided';
          mu_results[i]['venue']['city'] = 'Not provided';
        }

        if (typeof mu_results[i]['fee'] != 'undefined'){
              price = mu_results[i]['fee']['amount'];
          }

        $("#tbody").append("<tr>"); //Start populating table of events--column names created in view          

        for (var n=0; n<7; n++) //for loop fills in the 7 table fields
        { 
          if (n < 1)
            $("#tbody").append("<td>" + date + "</td>");  
          else if (n < 2)
            $("#tbody").append("<td>" + time + "</td>");
          else if (n < 3)
            $("#tbody").append("<td>" + mu_results[i][fields[n]] + "</td>");
          else if (n < 4)
            $("#tbody").append("<td>" + price + "</td>");
          else if(n < 5) {  
              if (typeof mu_results[i]['event_url'] == 'undefined'){//This undefined error avoided here because it affects matters beyond the called variable
                  $("#tbody").append("<td> Not provided </td>");
                }
              else{            
                $("#tbody").append("<td><a href='" + mu_results[i][fields[n]] + " ' target='_blank'> Go to event website</a> </td>"); //link opens window in new tab, to avoid back-button API issues
                }
            }  
          else {       
              $("#tbody").append("<td>" + mu_results[i]['venue'][fields[n]] + "</td>");
            }
          $("#tbody").append("</tr>");
        }             
      };        
    }

  });