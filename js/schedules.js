// schedules.js - Schedule search and display functionality for Kuching ART website

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');
    const dateInput = document.getElementById('date');
    const searchButton = document.querySelector('button[onclick="searchSchedules()"]');
    const scheduleResults = document.getElementById('schedule-results');
    
    // Initialize station data (in a real app, this would come from a server)
    const stations = [
        { id: 'kuching-sentral', name: 'Kuching Sentral', routes: ['blue-line', 'red-line'] },
        { id: 'satok', name: 'Satok', routes: ['blue-line'] },
        { id: 'damai', name: 'Damai', routes: ['red-line'] },
        { id: 'petra-jaya', name: 'Petra Jaya', routes: ['blue-line'] },
        { id: 'samarahan', name: 'Samarahan', routes: ['red-line'] }
    ];
    
    // Initialize route data
    const routes = [
        { id: 'blue-line', name: 'Blue Line', color: '#0066cc', stations: ['kuching-sentral', 'satok', 'petra-jaya'] },
        { id: 'red-line', name: 'Red Line', color: '#cc0000', stations: ['kuching-sentral', 'damai', 'samarahan'] }
    ];
    
    // Set up search button click handler (defined in the HTML)
    window.searchSchedules = function() {
        const origin = originSelect.value;
        const destination = destinationSelect.value;
        const date = dateInput.value;
        
        if (!origin || !destination || !date) {
            alert('Please select origin, destination, and date.');
            return;
        }
        
        if (origin === destination) {
            alert('Origin and destination stations cannot be the same.');
            return;
        }
        
        // Find available routes between the stations
        const availableRoutes = findAvailableRoutes(origin, destination);
        
        if (availableRoutes.length === 0) {
            scheduleResults.innerHTML = '<p>No direct routes available between the selected stations. Please select different stations.</p>';
            return;
        }
        
        // Generate and display schedules
        displaySchedules(origin, destination, date, availableRoutes);
    };
    
    // If we're on a page with a date input, set the minimum date to today
    if (dateInput) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        
        dateInput.min = yyyy + '-' + mm + '-' + dd;
    }
    
    // Find available routes between two stations
    function findAvailableRoutes(originId, destinationId) {
        const originStation = stations.find(station => station.id === originId);
        const destinationStation = stations.find(station => station.id === destinationId);
        
        if (!originStation || !destinationStation) {
            return [];
        }
        
        // Find routes that contain both stations
        return routes.filter(route => {
            return route.stations.includes(originId) && route.stations.includes(destinationId);
        });
    }
    
    // Calculate price based on stations
    function calculatePrice(originId, destinationId) {
        // Base fare
        let price = 2.00;
        
        // Add fare based on stations (simplified version)
        if (originId === 'kuching-sentral') {
            if (destinationId === 'satok' || destinationId === 'damai') {
                price = 2.00;
            } else if (destinationId === 'petra-jaya') {
                price = 3.50;
            } else if (destinationId === 'samarahan') {
                price = 5.00;
            }
        } else if (originId === 'satok') {
            if (destinationId === 'kuching-sentral') {
                price = 2.00;
            } else if (destinationId === 'petra-jaya') {
                price = 2.00;
            } else {
                price = 3.50;
            }
        } else if (originId === 'damai') {
            if (destinationId === 'kuching-sentral') {
                price = 2.00;
            } else if (destinationId === 'samarahan') {
                price = 3.50;
            } else {
                price = 3.50;
            }
        } else if (originId === 'petra-jaya') {
            if (destinationId === 'satok') {
                price = 2.00;
            } else if (destinationId === 'kuching-sentral') {
                price = 3.50;
            } else {
                price = 5.00;
            }
        } else if (originId === 'samarahan') {
            if (destinationId === 'damai') {
                price = 3.50;
            } else if (destinationId === 'kuching-sentral') {
                price = 5.00;
            } else {
                price = 5.00;
            }
        }
        
        return price;
    }
    
    // Display schedules
    function displaySchedules(originId, destinationId, date, availableRoutes) {
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay(); // 0-6 (Sunday to Saturday)
        
        let scheduleHTML = '';
        
        // Get station names
        const originStation = stations.find(station => station.id === originId);
        const destinationStation = stations.find(station => station.id === destinationId);
        
        // Calculate the fare
        const fare = calculatePrice(originId, destinationId);
        
        // Generate trips for each route
        availableRoutes.forEach(route => {
            // Generate trip times based on the day of the week
            const tripTimes = generateTripTimes(route.id, dayOfWeek);
            
            // Add route header
            scheduleHTML += `
                <div class="route-schedule">
                    <h3 style="color: ${route.color};">${route.name}</h3>
                    <p>${originStation.name} to ${destinationStation.name}</p>
                    <div class="schedule-items">
            `;
            
            // Add trip times
            tripTimes.forEach(trip => {
                // Calculate approximate arrival time (add 15-30 minutes based on distance)
                const departureTime = new Date(selectedDate);
                const [hours, minutes] = trip.split(':');
                departureTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                // Calculate the travel time based on the stations (simplified)
                const travelTime = calculateTravelTime(originId, destinationId);
                
                const arrivalTime = new Date(departureTime);
                arrivalTime.setMinutes(arrivalTime.getMinutes() + travelTime);
                
                // Format times
                const formattedDepartureTime = formatTime(departureTime);
                const formattedArrivalTime = formatTime(arrivalTime);
                
                scheduleHTML += `
                    <div class="schedule-item">
                        <div class="schedule-time">
                            <div class="departure-time">${formattedDepartureTime}</div>
                            <div class="travel-time">${travelTime} min</div>
                            <div class="arrival-time">${formattedArrivalTime}</div>
                        </div>
                        <div class="schedule-stations">
                            <div>${originStation.name}</div>
                            <div>to</div>
                            <div>${destinationStation.name}</div>
                        </div>
                        <div class="schedule-price">RM ${fare.toFixed(2)}</div>
                        <a href="booking.html?origin=${originId}&destination=${destinationId}&date=${date}&time=${hours}:${minutes}" class="book-now-btn">Book Now</a>
                    </div>
                `;
            });
            
            scheduleHTML += `
                    </div>
                </div>
            `;
        });
        
        // Display the schedules
        scheduleResults.innerHTML = scheduleHTML;
    }
    
    // Generate trip times based on route and day of week
    function generateTripTimes(routeId, dayOfWeek) {
        // Weekday (Monday to Friday)
        const weekdayTimes = [];
        
        // Generate times every 15 minutes during peak hours, 30 minutes otherwise
        // Peak hours: 6-9 AM and 4-7 PM
        for (let hour = 6; hour <= 22; hour++) {
            const isPeakHour = (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 19);
            const interval = isPeakHour ? 15 : 30;
            
            for (let minute = 0; minute < 60; minute += interval) {
                const formattedHour = hour < 10 ? '0' + hour : hour;
                const formattedMinute = minute < 10 ? '0' + minute : minute;
                weekdayTimes.push(`${formattedHour}:${formattedMinute}`);
            }
        }
        
        // Weekend (Saturday and Sunday)
        const weekendTimes = [];
        
        // Generate times every 30 minutes
        for (let hour = 7; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const formattedHour = hour < 10 ? '0' + hour : hour;
                const formattedMinute = minute < 10 ? '0' + minute : minute;
                weekendTimes.push(`${formattedHour}:${formattedMinute}`);
            }
        }
        
        // Blue line runs less frequently on weekends
        if (routeId === 'blue-line' && (dayOfWeek === 0 || dayOfWeek === 6)) {
            // Filter to have trips every hour
            return weekendTimes.filter((_, index) => index % 2 === 0);
        }
        
        // Return appropriate times based on day of week
        return (dayOfWeek >= 1 && dayOfWeek <= 5) ? weekdayTimes : weekendTimes;
    }
    
    // Calculate travel time between stations
    function calculateTravelTime(originId, destinationId) {
        // In a real app, this would be based on actual distances and speeds
        // For this demo, we'll use a simplified approach
        
        // Base travel time
        let travelTime = 15;
        
        // Adjust based on stations
        if (originId === 'kuching-sentral') {
            if (destinationId === 'satok' || destinationId === 'damai') {
                travelTime = 15;
            } else if (destinationId === 'petra-jaya') {
                travelTime = 25;
            } else if (destinationId === 'samarahan') {
                travelTime = 35;
            }
        } else if (originId === 'satok') {
            if (destinationId === 'kuching-sentral') {
                travelTime = 15;
            } else if (destinationId === 'petra-jaya') {
                travelTime = 10;
            } else {
                travelTime = 30;
            }
        } else if (originId === 'damai') {
            if (destinationId === 'kuching-sentral') {
                travelTime = 15;
            } else if (destinationId === 'samarahan') {
                travelTime = 20;
            } else {
                travelTime = 30;
            }
        } else if (originId === 'petra-jaya') {
            if (destinationId === 'satok') {
                travelTime = 10;
            } else if (destinationId === 'kuching-sentral') {
                travelTime = 25;
            } else {
                travelTime = 40;
            }
        } else if (originId === 'samarahan') {
            if (destinationId === 'damai') {
                travelTime = 20;
            } else if (destinationId === 'kuching-sentral') {
                travelTime = 35;
            } else {
                travelTime = 40;
            }
        }
        
        return travelTime;
    }
    
    // Format time for display (HH:MM AM/PM)
    function formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Hour '0' should be '12'
        
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${formattedMinutes} ${ampm}`;
    }
});
