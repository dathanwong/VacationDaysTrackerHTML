    let today = new Date();
    let arrayStartDate = new Date(today.getFullYear(),0,1);
    var events = [];
    var days = createArray(); //holds array of all the days
    console.log(days);
    

    //Default show today's date
    var date = new Date();
    populateCalendar(date.getFullYear(),date.getMonth());
    //Testing area
    getBalance(date);
    //Default populate today in event inputs
    $("#eventName").val("Test");
    $("#eventStart").val(date.toISOString().slice(0,-8));
    $("#eventEnd").val(date.toISOString().slice(0,-8));
    //Handle next and previous month button clicks
    $("#previousMonth").click(function(){
        //Update month
        date.setMonth(date.getMonth()-1);
        populateCalendar(date.getFullYear(), date.getMonth());
    });
    $("#nextMonth").click(function(){
        date.setMonth(date.getMonth()+1);
        populateCalendar(date.getFullYear(), date.getMonth());
    });
    //Handle submit button click to add events to calendar
    $("#addEvent").click(function(){
        console.log("Event added");
        var name = $("#eventName").val();
        var start = $("#eventStart").val();
        var end = $("#eventEnd").val();
        var milStart = Date.parse(start);
        var milEnd = Date.parse(end);
        events.push({"name":name,"start":milStart,"end":milEnd, "readableStart":start, "readableEnd":end});
        //add event to the array
        addEvent(name, milStart, milEnd);
        populateEvents(events);
    });

    //Function add an event to the days array and recalculate the balances
    function addEvent(name, start, end){
        var event = {"name":name, "start":start, "end":end};
        var index = getDateIndex(start)-1;
        //Add event into dates array
        for(var i = 0; i < diffDays(start,end); i++){
            days[index+i].hasEvent = true;
            days[index+i].event = event;
            changeHours(index+i,-8);
        }
    }

    //Function to remove hours from balance and make sure it propagates through
    function changeHours(index, hours){
        for(var i = index; i < days.length;i++){
            days[i].balance += hours;
        }
    }

    //function to get the index value of the date in the array
    //Enter date in milliseconds
    function getDateIndex(date){
        return diffDays(arrayStartDate.getTime(),date);
    }

    //function to initialize the array of all values
    function createArray(){
        //Create two years of values starting with January 1 from the current dates year
        var days = [];
        var balance = 40; //Balance at the start of the current year, if today is April 1, 2020 this is the balance at January 1, 2020
        var accRate = 5; //in hour
        var accDay = 5; //Day that the balance should increase 0 = Sunday, 1 = Monday, 2 = Tuesday etc.
        var accWeeks = 2; //accWeeks and accDay together tells what day of which week to accure, for example accDay = 5 and accWeeks = 2 means every two Fridays the balance increases
        var weekNum = 0;
        var today = new Date();
        var day = new Date(arrayStartDate.getTime());
        //Create an object representing the day and add to array
        for(var i = 0; i < 400; i++){
            //if day meets conditions of accrual then increment balance
            if(day.getDay() === accDay){
                weekNum++;
                if(weekNum === accWeeks){
                    balance += accRate;
                    weekNum = 0;
                }
            }
            var dateObject = {"date":day.getTime(), "balance":balance,"hasEvent":false,"eventName":""}
            days.push(dateObject);
            day.setDate(day.getDate()+1);
        }
        return days;
    }

    //Get vacation balance on the specified day
    function getBalance(date){
        //Variables for initializing vacation days
        var balanceStart = new Date(2020,0,0,23,59); //Specifies the day that we want to start calculating the balance at
        var balance = 40; //in hours, intialize with the balance at the specified balanceStart
        var accRate = 5; //in hour
        var accDay = 5; //Day that the balance should increase 0 = Sunday, 1 = Monday, 2 = Tuesday etc.
        var accWeeks = 2; //accWeeks and accDay together tells what day of which week to accure, for example accDay = 5 and accWeeks = 2 means every two Fridays the balance increases
        var diffInDays = diffDays(balanceStart,date);
        var weekNum = 0;
        var workDayLength = 8; //Specifies numbers of hours in a workday
        for(var i = 0; i < diffInDays; i++){
            balanceStart.setDate(balanceStart.getDate() + 1);
            //if day meets conditions of accrual then increment balance
            if(balanceStart.getDay() === accDay){
                weekNum++;
                if(weekNum === accWeeks){
                    balance += accRate;
                    weekNum = 0;
                }
            }
            //decrement if there is an event
            //Right now it is not calculating hours and only calculating days
            for(var j = 0; j < events.length; j++){
                if(events[j].start <= balanceStart.getTime() && events[j].end >= balanceStart.getTime()){
                    balance -= workDayLength;
                    break;
                }
            }
        }
        return balance;
    }
    //Calculates the difference in the number of days between two dates
    //Enter dates in milliseconds
    function diffDays(start, end){
        return Math.ceil((end-start)/86400000);
    }
    //Function to show event list
    function populateEvents(events){
        //Clear current events list
        $("#events").empty();
        //Populate the table
        
        for(var i = 0; i < events.length;i++){
            var startTime = Date();
            var endTime = Date(events[i].end);
            console.log("End Time:"+endTime.toString());
            //convert time in milliseconds to readable date
            $("#events").append("<tr><td>"+events[i].name+"</td><td>"+events[i].readableStart+"</td><td>"+events[i].readableEnd.toString()+"</td></tr>");
        }
        //update balances on calendar
        populateCalendar(date.getFullYear(),date.getMonth());
    }
    //Function to populate the calendar
    function populateCalendar(year, month){
        var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
        ];
        console.log("Populating Calendar");
        //clear the calendar
        $("#calendar").empty();
        //Update title
        $(".month").text(months[month]);
        $(".year").text(year);
        //Find the first day
        var first = getFirstDay(year,month);
        var last = new Date(year, month+1, 0).getDate();
        var count = 0;
        var today = new Date(year,month,1);
        var tomorrow = new Date(year,month,2);
        var yesterday = new Date(year, month, 0);
        var week = 0;
        for(var i = 0 ; i < 42; i++){
            //if already added 7 cols then add a new row
            if(i%7 === 0){
                week++;
                $("#calendar").append("<tr class='dates-"+week+"'></tr>");
            }
            //if the weekday isn't the first of the month yet then add a blank item
            if(count < first || today.getDate() > last){
                $(".dates-"+ week).append("<td></td>");
                count++;
            }else{
                if(today.getDate() <= last){
                    var todayIndex = getDateIndex(today);
                    var todayBalance = days[todayIndex].balance;
                    var tomorrowBalance = days[todayIndex+1].balance;
                    var yesterdayBalance = days[todayIndex-1].balance;
                    //Add date item to calendar
                    //Add date
                    var td = "<td><p>"+today.getDate()+"</p>";
                    //Add vacation balance
                    if(yesterdayBalance > todayBalance){
                        td += "<p class='balance decrease'>"+todayBalance+"</p>";  
                    }else if (yesterdayBalance < todayBalance){
                        td += "<p class='balance increase'>"+todayBalance+"</p>";  
                    }else{
                        td += "<p class='balance'>"+todayBalance+"</p>";  
                    }
                    //add event
                    if(days[todayIndex].hasEvent){
                        td += "<p class='eventIcon'>"+days[todayIndex].event.name+"</p>";
                    }
                    //close out <td> element
                    td += "</td>";
                    $(".dates-"+week).append(td);
                    today.setDate(today.getDate()+1);
                    tomorrow.setDate(tomorrow.getDate()+1);
                    yesterday.setDate(yesterday.getDate()+1);
                }
            }
        }
    }
    //Function returns the day of the week that the first day of the given month is(Monday:0, Tuesday:1, Wednesday:2)
    function getFirstDay(year,month){
        var days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ]
        var first = new Date(year, month, 1);
        console.log("First day of the month is a " + days[first.getDay()]);
        return first.getDay();
    }