var readingsUrl = 'https://m9drg2gpya.execute-api.us-east-2.amazonaws.com/default/getRequest';
var userid = 1; // should change based on current session
var key = 'sS6BW9aZNY1NMndVf6s9V6LegVVn7WPj5xuVnq9b';

var device = 1;

var device1Temps = [];
var device1Humidities = [];
var device2Temps = [];
var device2Humidities = [];

/* CHECK TEMPERATURES */
function checkTemps(deviceid, temps) {
    
    // Get current temperature timestamp
    let currentTemp = temps[0];
    
    // Get timestamps for previous days at the same time
    let today = new Date(currentTemp.timestamp);
    let oneDayAgo = dateFns.subDays(today, 1);
    let twoDaysAgo = dateFns.subDays(today, 2);
    /*console.log(today);
    console.log(oneDayAgo);
    console.log(twoDaysAgo);*/
    
    /* here we will return readings from previous dates, put them into
       variables and find which readings are the closest to our created timestamps */
    
    var dates = [];
    for(var i = 0; i < temps.length; i++) {
        dates = dates.concat(temps[i].timestamp);
    }
    // yesterdays, the day befores, maybe a year or two ago as well
    let oneDayAgoTemp = temps[dateFns.closestIndexTo(oneDayAgo, dates)].sensor_value;
    let twoDaysAgoTemp = temps[dateFns.closestIndexTo(twoDaysAgo, dates)].sensor_value;
    
    avgTemp = (oneDayAgoTemp + twoDaysAgoTemp)/2;
    
    // Here we have a small buffer rather than needing to match the temperature perfectly
    if(currentTemp.sensor_value > avgTemp + 3) {
        $('#device' + deviceid + 'TempStatus').html("Too Hot!");
    }
    else if(currentTemp.sensor_value < avgTemp - 3) {
        $('#device' + deviceid + 'TempStatus').html("Too Cold!");
    }
    else {
        $('#device' + deviceid + 'TempStatus').html("Temperature OK!");
    }
}

/* CHECK TEMPERATURES */
function checkHumidity(deviceid, humidities) {
    
    // Get current temperature timestamp
    let currentHumidity = humidities[0];
    
    // Get timestamps for previous days at the same time
    let today = new Date(currentHumidity.timestamp);
    let oneDayAgo = dateFns.subDays(today, 1);
    let twoDaysAgo = dateFns.subDays(today, 2);
    
    /* here we will return readings from previous dates, put them into
       variables and find which readings are the closest to our created timestamps */
    
    var dates = [];
    for(var i = 0; i < humidities.length; i++) {
        dates = dates.concat(humidities[i].timestamp);
    }
    // yesterdays, the day befores, maybe a year or two ago as well
    let oneDayAgoHumidity = humidities[dateFns.closestIndexTo(oneDayAgo, dates)].sensor_value;
    let twoDaysAgoHumidity = humidities[dateFns.closestIndexTo(twoDaysAgo, dates)].sensor_value;
    
    avgHumidity = (oneDayAgoHumidity + twoDaysAgoHumidity)/2;
    
    // Here we have a small buffer rather than needing to match the temperature perfectly
    if(currentHumidity.sensor_value > avgHumidity + 3) {
        $('#device' + deviceid + 'HumidityStatus').html("Too Humid!");
    }
    else if(currentHumidity.sensor_value < avgHumidity - 3) {
        $('#device' + deviceid + 'HumidityStatus').html("Too Dry!");
    }
    else {
        $('#device' + deviceid + 'HumidityStatus').html("Humidity OK!");
    }
}

/* CHECK DEVICE CONSISTENCY */
// Compared each devices readings to eachother over a 2 week period
function checkDeviceConsistency(device1Readings, device2Readings, sensorType) {
    today = new Date();
    twoWeeksAgo = dateFns.subWeeks(today, 2);
    console.log(twoWeeksAgo);
    
}



/* CHECK DEVICE BEHAVIOUR */
function checkDeviceBehaviour() {
    
}


/* PERIODICALLY GET DEVICE READINGS */
(function getUserData() {
  $.ajax({
    url: readingsUrl,
    headers: {
      "X-Api-Key":key,
    },
    data: {
        'user_id': userid
    },
    success: function(data) {
        // Sort the returned data to ensure we are using the latest readings for our calculations
        data.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        
        // Sort the returned data into humidity and temperature arrays
        for(var i = 0; i < data.length; i++) {
            if(data[i].sensor_type == "TEMP") {
                if(data[i].device_id == 1) {
                    device1Temps = device1Temps.concat(data[i])
                }
                else {
                    device2Temps = device2Temps.concat(data[i])
                }
            }
            else if(data[i].sensor_type == "HUMIDITY") {
                if(data[i].device_id == 1) {
                    device1Humidities = device1Humidities.concat(data[i])
                }
                else {
                    device2Humidities = device2Humidities.concat(data[i])
                }
            }
        }
        checkTemps(1, device1Temps);
        checkTemps(2, device2Temps);
        
        checkHumidity(1, device1Humidities);
        checkHumidity(2, device2Humidities);
        
        checkDeviceConsistency(device1Temps, device2Temps, 'TEMP');
    },
    complete: function() {
      // Schedule the next request when the current one's complete
      //setTimeout(getUserData, 60000); !!! UNCOMMENT THIS !!!
    }
  });
})();