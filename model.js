var device1Url = 'https://m9drg2gpya.execute-api.us-east-2.amazonaws.com/default/getRequest?deviceid=1';
var device2Url = 'https://m9drg2gpya.execute-api.us-east-2.amazonaws.com/default/getRequest?deviceid=2';
var key = 'sS6BW9aZNY1NMndVf6s9V6LegVVn7WPj5xuVnq9b';

var device1Temps = [];
var device1Humidities = [];
var device2Temps = [];
var device2Humidities = [];

/* CHECK TEMPERATURES */
function checkDevice1Temp() {
    // CurrentTemp will be retrieved from the device
    var currentTemp = device1Temps[0].sensor_value;
    console.log(currentTemp);
    // Device will retrieve a few previous readings from similar dates
    var previousTemp1 = device1Temps[1].sensor_value;
    var previousTemp2 = device1Temps[2].sensor_value;
    var previousTemp3 = device1Temps[3].sensor_value;
    var previousTemp4 = device1Temps[4].sensor_value;
    // From these retrieved temps it will work out a happy medium
    var preferredTemp = ((previousTemp1 + previousTemp2 + previousTemp3 + previousTemp4) /4);
    
    // Here we have a small buffer rather than needing to match the temperature perfectly
    if((currentTemp > preferredTemp - 4) && (currentTemp < preferredTemp + 4)) {
        $('#device1TempStatus').html("Temperature OK!");
    }
    else if(currentTemp > preferredTemp) {
        $('#device1TempStatus').html("Too Hot!");
    }
    else {
        $('#device1TempStatus').html("Too Cold!");
    }  
}

function checkDevice2Temp() {
    // CurrentTemp will be retrieved from the device
    var currentTemp = device2Temps[0].sensor_value;
    // Device will retrieve a few previous readings from similar dates
    var previousTemp1 = device2Temps[1].sensor_value;
    var previousTemp2 = device2Temps[2].sensor_value;
    var previousTemp3 = device2Temps[3].sensor_value;
    var previousTemp4 = device2Temps[4].sensor_value;
    // From these retrieved temps it will work out a happy medium
    var preferredTemp = ((previousTemp1 + previousTemp2 + previousTemp3 + previousTemp4) /4);
    
    // Here we have a small buffer rather than needing to match the temperature perfectly
    if((currentTemp > preferredTemp - 4) && (currentTemp < preferredTemp + 4)) {
        $('#device2TempStatus').html("Temperature OK!");
    }
    else if(currentTemp > preferredTemp) {
        $('#device2TempStatus').html("Too Hot!");
    }
    else {
        $('#device2TempStatus').html("Too Cold!");
    }  
}

/* CHECK HUMIDITIES */
function checkDevice1Humidity() {
    // CurrentTemp will be retrieved from the device
    var currentHumidity = device1Temps[0].sensor_value;
    // Device will retrieve a few previous readings from similar dates
    var previousHumidity1 = device1Humidities[1].sensor_value;
    var previousHumidity2 = device1Humidities[2].sensor_value;
    var previousHumidity3 = device1Humidities[3].sensor_value;
    var previousHumidity4 = device1Humidities[4].sensor_value;
    // From these retrieved temps it will work out a happy medium
    var preferredHumidity = ((previousHumidity1 + previousHumidity2 + previousHumidity3 + previousHumidity4) /4);
    
    // Here we have a small buffer rather than needing to match the temperature perfectly
    if((currentHumidity > preferredHumidity - 4) && (currentTemp < preferredTemp + 4)) {
        $('#device1HumidityStatus').html("Humidity OK!");
    }
    else if(currentHumidity > preferredHumidity) {
        $('#device1HumidityStatus').html("Too Humid!");
    }
    else {
        $('#device1HumidityStatus').html("Humidity Low!");
    } 
}

function checkDevice2Humidity() {
    // CurrentTemp will be retrieved from the device
    var currentHumidity = device2Temps[0].sensor_value;
    // Device will retrieve a few previous readings from similar dates
    var previousHumidity1 = device2Humidities[1].sensor_value;
    var previousHumidity2 = device2Humidities[2].sensor_value;
    var previousHumidity3 = device2Humidities[3].sensor_value;
    var previousHumidity4 = device2Humidities[4].sensor_value;
    // From these retrieved temps it will work out a happy medium
    var preferredHumidity = ((previousHumidity1 + previousHumidity2 + previousHumidity3 + previousHumidity4) /4);
    
    // Here we have a small buffer rather than needing to match the temperature perfectly
    if((currentHumidity > preferredHumidity - 4) && (currentTemp < preferredTemp + 4)) {
        $('#device2HumidityStatus').html("Humidity OK!");
    }
    else if(currentHumidity > preferredHumidity) {
        $('#device2HumidityStatus').html("Too Humid!");
    }
    else {
        $('#device2HumidityStatus').html("Humidity Low!");
    } 
}

/* COMPARE DEVICES */
function compareTemps() {
    var averageDevice1Temp =
        ((device1Temps[0] +
         device1Temps[1] +
         device1Temps[2] +
         device1Temps[3] +
         device1Temps[4] +
         device1Temps[5])/5)
    
    var averageDevice2Temp =
        ((device2Temps[0] +
         device2Temps[1] +
         device2Temps[2] +
         device2Temps[3] +
         device2Temps[4] +
         device2Temps[5])/5)
    
    var diff = averageDevice1Temp - averageDevice2Temp;
    
    if((diff > 4) || (diff < -4)) {
        $('#deviceStatus').html('Discrepancy Detected');
    }
    else {
        $('#deviceStatus').html('Devices OK');
    }
}

/* CHECK DEVICE1 BEHAVIOUR */
function checkDeviceBehaviour() {
    
}

/* CHECK DEVICE2 BEHAVIOUR */



/* PERIODICALLY GET DEVICE 1 READINGS */
(function readDevice1() {
  $.ajax({
    url: device1Url,
    headers: {
      "X-Api-Key":key,
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
                device1Temps = device1Temps.concat(data[i]);
            }
            else if(data[i].sensor_type == "HUMIDITY") {
                device1Humidities = device1Humidities.concat(data[i]);
            }
        }
        checkDevice1Temp();
        checkDevice1Humidity();
        compareTemps();
    },
    complete: function() {
      // Schedule the next request when the current one's complete
      //setTimeout(worker, 60000);
    }
  });
})();

/* PERIODICALLY GET DEVICE 2 READINGS */
(function readDevice2() {
  $.ajax({
    url: device2Url,
    headers: {
      "X-Api-Key":key,
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
                device2Temps = device2Temps.concat(data[i]);
            }
            else if(data[i].sensor_type == "HUMIDITY") {
                device2Humidities = device2Humidities.concat(data[i]);
            }
        }
        checkDevice2Temp();
        checkDevice2Humidity();
        compareTemps();
    },
    complete: function() {
      // Schedule the next request when the current one's complete
      //setTimeout(worker, 60000);
    }
  });
})();