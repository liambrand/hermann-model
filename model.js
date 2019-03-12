var getAllSensorValuesUrl = 'https://m9drg2gpya.execute-api.us-east-2.amazonaws.com/default/getRequest';
var getAllSensorValuesKey = 'sS6BW9aZNY1NMndVf6s9V6LegVVn7WPj5xuVnq9b';

var getTodaysSensorValuesUrl = 'https://9ojj5uftgf.execute-api.us-east-2.amazonaws.com/default/sensorReadingsToday';
var getTodaysSensorValuesKey = 'kx4tWgjZ8982fSSbI1NBy7QgLw1Ep2AT7bpqZgTD';

var userid = 1; // should change based on current session

var device1Temps = [];
var device1Humidities = [];
var device2Temps = [];
var device2Humidities = [];

var todaysDevice1Temps = [];
var todaysDevice1Humidities = [];
var todaysDevice2Temps = [];
var todaysDevice2Humidities = [];


/* CHECK TEMPERATURE */
function temperatureCheck(deviceid, temps) {
    // First we get the current temperature
    let latestReading = temps[0];
    
    // Get previous timestamps we want relevant data for
    timestamps = getPreviousTimestamps(new Date(latestReading.timestamp));
    
    // Get previous sensor readings from similar times
    let previousReadings = [];
    for(let i = 0; i < timestamps.length; i++) {
        previousReadings = previousReadings.concat(getReadingByTimestamp(temps, timestamps[i]));
    }
    
    // Get relevant MetOffice readings
    
    
    // Work out general preferred temp
    let averageTemp = null;
    for(let i = 0; i < previousReadings.length; i++) {
        averageTemp = averageTemp + previousReadings[i];
    }
    averageTemp = averageTemp/previousReadings.length;
    
    // Compare it to the current temp and take appropriate action
    // We use a small buffer rather than needing it to match the temperature perfectly
    if(latestReading.sensor_value > averageTemp + 3) {
        $('#device' + deviceid + 'TempStatus').html("Too hot, turn down heating");
    }
    else if(latestReading.sensor_value < averageTemp - 3) {
        $('#device' + deviceid + 'TempStatus').html("Too cold, turn up heating");
    }
    else {
        $('#device' + deviceid + 'TempStatus').html("Temperature OK");
    }    
}

/* CHECK HUMIDITY */
function humidityCheck(deviceid, humidities) {
    // First we get the current temperature
    let latestReading = humidities[0];
    
    // Get previous timestamps we want relevant data for
    timestamps = getPreviousTimestamps(new Date(latestReading.timestamp));
    
    // Get previous sensor readings from similar times
    let previousReadings = [];
    for(let i = 0; i < timestamps.length; i++) {
        previousReadings = previousReadings.concat(getReadingByTimestamp(humidities, timestamps[i]));
    }
    
    // Work out general humidity
    let averageHumidity = null;
    for(let i = 0; i < previousReadings.length; i++) {
        averageHumidity = averageHumidity + previousReadings[i];
    }
    averageHumidity = averageHumidity/previousReadings.length;
    
    // Compare it to the current temp and take appropriate action
    // We use a small buffer rather than needing it to match the temperature perfectly
    if(latestReading.sensor_value > averageHumidity + 3) {
        $('#device' + deviceid + 'HumidityStatus').html("Too humid");
    }
    else if(latestReading.sensor_value < averageHumidity - 3) {
        $('#device' + deviceid + 'HumidityStatus').html("Too dry");
    }
    else {
        $('#device' + deviceid + 'HumidityStatus').html("Humidity OK");
    }     
}

// This compares readings from the two different devices to look for discrepancies
// These could be caused by technical issues or environmental issues e.g. poor insulation
function checkDiscrepancies(device1Readings, device2Readings) {   
    console.log(device1Readings);
    console.log(device2Readings);
    
    // Iterate through device 1 readings
    for(let i = 0; i < device1Readings.length; i++) {
        
        // Get some dates
        let startDate = new Date(dateFns.subHours(new Date(device1Readings[i].timestamp, 1)));
        let endDate = new Date(device1Readings[i].timestamp);
        
        // If device 2 reading's timestamp is within an hour it's comparable
        try {
            if(dateFns.isWithinRange(new Date(device2Readings[i].timestamp), startDate, endDate)) {
                // compare them and do something with them here
                console.log("hello");
            }
        }
        catch(TypeError) {
            console.log("No Reading Available");
        }
    }
}

// This checks for erratic readings caused by things such as environmental events 
// and technical problems
function checkFluctuations(deviceid, readings, sensor) {
    // TEMP HACK WHILE I FIGURE OUT THE 'TODAYS READINGS' ENDPOINT
    todaysReadings = [];
    for(let i = 0; i < 30; i++) {
        todaysReadings = todaysReadings.concat(readings[i]);
    }
    
    dateToTest = new Date(todaysReadings[0].timestamp);
    // Get the past two hours' readings
    twoHoursReadings = getLastTwoHoursReadings(todaysReadings, dateToTest);
    // END OF HACK
    
    let discrepencies = 0;
    for(let i = 0; i < twoHoursReadings.length - 1; i++) {
        let diff = null;
        
        diff = Math.abs(twoHoursReadings[i].sensor_value - twoHoursReadings[i+1].sensor_value);
        //console.log(twoHoursReadings[i].sensor_value);
        //console.log(twoHoursReadings[i+1].sensor_value);
        //console.log(diff);
        if(diff > 6) {
            if(twoHoursReadings[i].sensor_value > twoHoursReadings[i+1].sensor_value) {
                //console.log("WARNING: Temperature Drop of " + diff +  " Detected");
                $('#device' + deviceid + 'FluctuationsStatus').html("WARNING: Temperature Drop of " + diff +  " Detected");
                discrepencies++;
            }
            else if (twoHoursReadings[i].sensor_value < twoHoursReadings[i+1].sensor_value) {
                //console.log("WARNING: Temperature Rise of " + diff +  " Detected");
                $('#device' + deviceid + 'FluctuationsStatus').html("WARNING: Temperature Rise of " + diff +  " Detected");
                discrepencies++;
            }
        }
        if(discrepencies >= 3) {
            //console.log("Multiple discrepencies detected: consider contacting support");
            $('#device' + deviceid + 'FluctuationsStatus').append("<p>Multiple discrepencies detected: consider contacting support</p>");
        }
    }
    
}

var intervalID = setInterval(function() {
    console.log("Interval reached");
}, 300000);

/* PERIODICALLY GET ALL DEVICE READINGS */
(function getAllUserData() {
  $.ajax({
    url: getAllSensorValuesUrl,
    headers: {
      "X-Api-Key":getAllSensorValuesKey,
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
        // Device 1 checks
        temperatureCheck(1, device1Temps);
        humidityCheck(1, device1Humidities);
        
        // Device 2 checks
        temperatureCheck(2, device2Temps);
        humidityCheck(2, device2Humidities);
        
        // Check for reading fluctuations
        checkFluctuations(1, device1Temps, 'TEMP');
        //checkFluctuations(2, device2Temps, 'TEMP');
        
        // Check consistency across devices
        checkDiscrepancies(device1Temps, device2Temps);
    },
    complete: function() {
      // Schedule the next request when the current one's complete
      //setTimeout(getUserData, 1800000); (every half an hour) !!! UNCOMMENT THIS !!! 
    }
  });
})();



/* HELPER FUNCTIONS */
// This gives us the previous timestamps we need to find older readings
function getPreviousTimestamps(timestamp) {
    let oneDayAgo = dateFns.subDays(timestamp, 1);
    let twoDaysAgo = dateFns.subDays(timestamp, 2);
    let threeDayAgo = dateFns.subDays(timestamp, 3);
    let fourDaysAgo = dateFns.subDays(timestamp, 4);
    
    timestamps = [oneDayAgo, twoDaysAgo, threeDayAgo, fourDaysAgo];
    return timestamps;
}

// Given an array of readings and a timestamp, this function
// will return the reading with a timestamp the closest to the supplied one
function getReadingByTimestamp(readings, timestamp) {
    var dates = [];
    for(var i = 0; i < readings.length; i++) {
        dates = dates.concat(readings[i].timestamp);
    }
    // yesterdays, the day befores, maybe a year or two ago as well
    let reading = readings[dateFns.closestIndexTo(timestamp, dates)].sensor_value;
    return reading;
}

// Given an array of readings, this function returns readings
// taken in the past hour.
// somewhat hacky, timestamp lets us manipulate for testing purposes
function getLastTwoHoursReadings(readings, timestamp) {
    twoHoursReadings = [];
    for(let i = 0; i < readings.length; i++) {
        if(dateFns.isWithinRange(new Date(readings[i].timestamp), dateFns.subHours(timestamp, 2), timestamp)) {
            twoHoursReadings = twoHoursReadings.concat(readings[i]);
        }
    }
    twoHoursReadings.sort(function(a, b) { return new Date(a.timestamp) - new Date(b.timestamp)});
    return twoHoursReadings;
}