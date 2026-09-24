function updateModality(newModality) {
    eventLocation = document.getElementById('event_location');
    eventURL = document.getElementById('event_remote_url');

    if (newModality == 'In-Person') {
        eventLocation.setAttribute('required', '');
        eventLocation.parentElement.style.display = 'contents';

        eventURL.removeAttribute('required');
        eventURL.value = '';
        eventURL.parentElement.style.display = 'none';
    }
    else {
        eventURL.setAttribute('required', '');
        eventURL.parentElement.style.display = 'contents';

        eventLocation.removeAttribute('required');
        eventLocation.value = '';
        eventLocation.parentElement.style.display = 'none';
    }
}

let allEvents = [];
let allColorMappings = {
    "Standard": "#0d6efd",
    "Work": "#fff200",
    "Academics": "#ff0000",
    "Social": "#0dc5fd"
}

function loadModal() {
    const form = document.getElementById("event_form");
    form.reset();
    form.setAttribute('updateFlag', '');

    loadCategoriesToModal();
}

function loadCategoriesToModal() {
    const allCategories = Object.keys(allColorMappings);
    console.log(allCategories);
    const categoryDropdown = document.getElementById('eventCategory');
    categoryDropdown.innerHTML = "";
    for (let category of allCategories) {
        let option = document.createElement("option");
        option.innerHTML = category;
        option.setAttribute("value", category);
        categoryDropdown.appendChild(option);
    }

    loadColorFromCat(allCategories[0]);
}

function loadColorFromCat(cat) {
    const color = allColorMappings[cat] || "#0d6efd";
    
    document.getElementById('eventColor').setAttribute('style', `background-color: ${color};`)
}

function locateEventById(id) {
    for (let events of allEvents) {
        if (id == events.eventId) {
            console.log(id);
            return events;
        }
    }
}

function loadEventToModal(eventId) {
    const event = locateEventById(eventId);

    const modalElement = document.getElementById('modal-body');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();

    const form = document.getElementById("event_form");
    form.reset();
    form.setAttribute('updateFlag', `update-${event.eventId}`);

    // Run the load functions
    loadCategoriesToModal();
    loadColorFromCat(event.eventCategory);
    updateModality(event.eventModality);

    // Load data into the form
    // event_name, event_attendees

    document.getElementById("event_name").value = event.eventName;
    document.getElementById("event_attendees").value = event.eventAttendees;

    // event_remote_url // event_location
    document.getElementById("event_location").value = event.eventLocation;
    document.getElementById("event_remote_url").value = event.eventURL;

    // event_weekday, event_time, event_modality, event_category
    document.getElementById("event_weekday").value = event.eventWeekday;
    document.getElementById("event_time").value = event.eventTime;
    document.getElementById("event_modality").value = event.eventModality;
    document.getElementById("eventCategory").value = event.eventCategory;
}

function createEventDiv(eventData) {
    let eventContainer = document.querySelector(`#${(eventData.eventWeekday).toLowerCase()} .eventsContainer`);
    console.log(eventContainer);

    const color = allColorMappings[eventData.eventCategory] || "#0d6efd";
    console.log(color);

    const eventId = eventData.eventId;

    const eventDiv = document.createElement("div");
    eventDiv.setAttribute('event-id', eventId);
    eventDiv.id = `event-${eventId}`;

    let formalEventLocation = 'No Location Specified';
    if (eventData.eventURL != '') {
        formalEventLocation = eventData.eventURL;
    }
    else if (eventData.eventURL == '') {
        formalEventLocation = eventData.eventLocation;
    }

    const eventTemplate = `
        <div class="card shadow-sm rounded-3 h-100" style="border: 5px solid ${color};">
            <div class="card-body p-2 d-flex flex-column justify-content-between">
                <div>
                    <span class="badge bg-primary mb-1 text-truncate w-100" style="font-size: 0.65rem;">${eventData.eventModality}</span>
                    <h6 class="card-title fw-bold text-dark text-truncate mb-1" style="font-size: 0.8rem;">${eventData.eventName}</h6>
                    <h6 class="card-title text-dark text-truncate mb-1" style="font-size: 0.8rem;">@ ${formalEventLocation}</h6>
                </div>
                <div class="text-muted border-top pt-1 mt-1" style="font-size: 0.7rem;">
                    <i class="bi bi-clock me-1">${eventData.eventTime}</i>
                </div>
            </div>
        </div>
    `;
    eventDiv.innerHTML = eventTemplate;

    eventContainer.appendChild(eventDiv);

    console.log(eventId);
    document.getElementById(`event-${eventId}`).addEventListener("click", (e) => loadEventToModal(eventId));
}

document.getElementById("event_form").addEventListener("submit", function (e) {
    console.log('submitted');

    const formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(formData.entries());
    form = document.getElementById("event_form");

    if (data.eventModality == "Remote") {
        var regex = /^(https?:\/\/)?(www\.)?[a-zA-Z][a-zA-Z0-9]*\..+$/;
        if (!regex.test(data.eventURL)) {
            alert("Check the format of the url");
            e.preventDefault();
            return false;
        }
    }
    
    //Check if the form has the 'updateFlag' tag and proccess from there as updateFlag='' or updateFlag='update'
    if (form.getAttribute("updateFlag").startsWith('update')) {
        console.log('UPDATE!');
        const updateId = form.getAttribute("updateFlag").split('-')[1];
        data["eventId"] = updateId;
        
        // Save the entire object
        let dateChange = false;
        for (events in allEvents) {
            let event = allEvents[events];
            if (event.eventId == updateId) {
                // Mark whether the date changed
                if (event.eventWeekday != data.eventWeekday) dateChange = true;

                allEvents[events] = data;
                break;
            }
        }

        // Locate the element by Id, will NEVER change
        const eventDiv = document.getElementById(`event-${updateId}`)
        const weekdayDiv = document.getElementById(data.eventWeekday.toLowerCase()).getElementsByClassName('eventsContainer')[0];
        if (dateChange) {
            weekdayDiv.appendChild(eventDiv);
        }

        // Change the relevant element items - will be a fresh creation of the inner, wrapper with id needs nothing
        const color = allColorMappings[data.eventCategory] || "#0d6efd";

        let formalEventLocation = 'No Location Specified';
        if (data.eventURL != '') {
            formalEventLocation = data.eventURL;
        }
        else if (data.eventURL == '') {
            formalEventLocation = data.eventLocation;
        }

        const innerData = `
            <div class="card shadow-sm rounded-3 h-100" style="border: 5px solid ${color};">
                <div class="card-body p-2 d-flex flex-column justify-content-between">
                    <div>
                        <span class="badge bg-primary mb-1 text-truncate w-100" style="font-size: 0.65rem;">${data.eventModality}</span>
                        <h6 class="card-title fw-bold text-dark text-truncate mb-1" style="font-size: 0.8rem;">${data.eventName}</h6>
                    <h6 class="card-title text-dark text-truncate mb-1" style="font-size: 0.8rem;">@ ${formalEventLocation}</h6>
                    </div>
                    <div class="text-muted border-top pt-1 mt-1" style="font-size: 0.7rem;">
                        <i class="bi bi-clock me-1">${data.eventTime}</i>
                    </div>
                </div>
            </div>
        `;
        eventDiv.innerHTML = innerData;

        // Remove the updateFlag attribute
        form.removeAttribute('updateFlag');


        const modalElement = document.getElementById('modal-body');
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.hide();

        form.reset();
        e.preventDefault();
        return true;
    }
    
    color = data.eventColor;
    category = data.eventCategory;

    //Reject the form submission IF the `{eventName}@{eventTime}ON{eventWeekday}` is already taken
    eventName = `${data.eventName}@${data.eventTime}ON${data.eventWeekday}`;
    if (eventName in allEvents) {
        e.preventDefault();

        alert("Event (likely) already exists! Please check your Calendar!");
        return false;
    }

    let lastId = 0;
    if (allEvents.length > 0) {
        lastId = allEvents.at(-1)['eventId'];
    }
    data["eventId"] = lastId + 1;

    console.log(data);

    allEvents.push(data);
    createEventDiv(data);

    const modalElement = document.getElementById('modal-body');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();

    form.reset();
    e.preventDefault();
});