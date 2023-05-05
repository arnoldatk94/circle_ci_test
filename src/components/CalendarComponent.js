import "../App";
import { Calendar, momentLocalizer } from "react-big-calendar";
import React, { useEffect, useState } from "react";
import moment from "moment";

import { events } from "./exports/events";
import { PROPERTIES } from "./exports/properties";
import { FACILITY_TYPES } from "./exports/facilities";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";

const localizer = momentLocalizer(moment);

export default function CalendarComponent() {
  const [newEvent, setNewEvent] = useState({
    property_id: "",
    facility_id: "",
    title: "",
    start: "",
    end: "",
  });
  const [allEvents, setAllEvents] = useState(events);
  const [propertyFilter, setPropertyFilter] = useState();
  const [facilityFilter, setFacilityFilter] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState("");

  // Filter by property then filter by facilities that property has
  // const handleFacilityChange = (e) => {
  //   setSelectedFacility(e.target.value);
  // };
  const handleFacilityChange = (e) => {
    const facilityId = parseInt(e.target.value);
    setSelectedFacility(facilityId);
    setNewEvent({
      ...newEvent,
      facility_id: facilityId,
    });
  };

  const filteredFacilities =
    PROPERTIES.find((property) => property.property_id === newEvent.property_id)
      ?.facilities || [];

  // Click on event, then click on day to navigate to specific date
  function handleNavigate(date) {
    setSelectedDay(date);
  }

  const handleSelectEvent = (event) => {
    // console.log(event);
    setSelectedDay(event.start);
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleDeleteEvent = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (confirmDelete) {
      const updatedEvents = allEvents.filter((e) => e !== selectedEvent);
      setAllEvents(updatedEvents);
      setSelectedEvent(null);
      setShowDetails(false);
    }
  };

  const handleCancel = () => {
    setSelectedEvent(null);
    setShowDetails(false);
  };

  useEffect(() => {
    if (newEvent && newEvent.facility_id) {
      const facility = FACILITY_TYPES.find(
        (facility) => facility.id === Number(newEvent.facility_id)
      );
      console.log(facility);
    }
  }, [newEvent]);

  const handleAddEvent = () => {
    // Check for overlapping events
    const overlappingEvents = allEvents.filter((event) => {
      return (
        event.property_id === newEvent.property_id &&
        event.facility_id === newEvent.facility_id &&
        ((moment(newEvent.start) >= moment(event.start) &&
          moment(newEvent.start) < moment(event.end)) ||
          (moment(newEvent.end) > moment(event.start) &&
            moment(newEvent.end) <= moment(event.end)) ||
          (moment(newEvent.start) <= moment(event.start) &&
            moment(newEvent.end) >= moment(event.end)))
      );
    });

    if (overlappingEvents.length > 0) {
      // If there are overlapping events, show an error message and do not add the event
      alert("There is already an event scheduled during this time.");
      return;
    }
    // Find the facility type of the event being added
    const facilityType = FACILITY_TYPES[newEvent.facility_id - 1];
    console.log("Start", facilityType.startTime, "end", facilityType.endTime);

    // Check if unit info has been added
    if (!newEvent.title) {
      alert("Please enter your unit number");
    }

    // Check if the start time is between 10am and 11pm
    const startHour = moment(newEvent.start).hour();
    if (
      startHour < facilityType.startTime ||
      startHour >= facilityType.endTime
    ) {
      alert(
        `The facility can only be booked between ${
          facilityType.startTime
        }am and ${facilityType.endTime - 12}pm.`
      );
      return;
    }

    // Calculate the duration of the event in hours
    const durationInHours = moment
      .duration(moment(newEvent.end).diff(moment(newEvent.start)))
      .asHours();

    // Check if the duration exceeds the time limit for the facility
    if (durationInHours > facilityType.timeLimit) {
      // If the duration exceeds the time limit, show an error message and do not add the event
      alert(
        `The ${facilityType.name} facility has a maximum booking limit of ${facilityType.timeLimit} hours.`
      );
      return;
    }

    // If the duration does not exceed the time limit, add the event to the list of all events
    setAllEvents([...allEvents, newEvent]);
  };

  const handlePropertyFilter = (event) => {
    const value = event.target.value;
    setPropertyFilter(value);
    if (!value) {
      // clear the facilityFilter when propertyFilter is empty
      setFacilityFilter("");
    }
  };

  const handleFacilityFilter = (e) => {
    setFacilityFilter(e.target.value);
  };

  const filteredEvents =
    propertyFilter || facilityFilter
      ? allEvents.filter((event) => {
          if (propertyFilter && facilityFilter) {
            return (
              event.property_id.toString().includes(propertyFilter) &&
              event.facility_id.toString().includes(facilityFilter)
            );
          } else if (propertyFilter) {
            return event.property_id.toString().includes(propertyFilter);
          } else if (facilityFilter) {
            return event.facility_id.toString().includes(facilityFilter);
          }
          return true;
        })
      : allEvents;

  console.log(newEvent);
  return (
    <div>
      <h1>Calendar</h1>
      <h2>Add New Event</h2>
      <div style={{ display: "inline-flex", marginBottom: "20px" }}>
        <select
          onChange={(e) => {
            setNewEvent({ ...newEvent, property_id: parseInt(e.target.value) });
            setSelectedFacility("");
          }}
        >
          <option value="">Select a property</option>
          {PROPERTIES.map((property) => (
            <option key={property.property_id} value={property.property_id}>
              {property.name}
            </option>
          ))}
        </select>

        <select
          onChange={handleFacilityChange}
          value={selectedFacility}
          disabled={!newEvent.property_id}
        >
          <option value="">Select a facility</option>
          {FACILITY_TYPES.filter((facility) =>
            filteredFacilities.includes(facility.id)
          ).map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Add Unit"
          style={{ width: "20%", marginRight: "10px" }}
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
        />
        <input
          type="datetime-local"
          placeholder="Start Date"
          style={{ width: "40%", marginRight: "10px" }}
          value={
            newEvent.start
              ? moment(newEvent.start).format("YYYY-MM-DDTHH:mm")
              : ""
          }
          onChange={(e) => {
            const selectedDate = moment(
              e.target.value,
              "YYYY-MM-DDTHH:mm"
            ).toDate();
            setNewEvent({ ...newEvent, start: selectedDate });
          }}
        />
        <input
          type="datetime-local"
          placeholder="End Date"
          style={{ width: "40%", marginRight: "10px" }}
          value={
            newEvent.end ? moment(newEvent.end).format("YYYY-MM-DDTHH:mm") : ""
          }
          onChange={(e) => {
            const selectedDate = moment(
              e.target.value,
              "YYYY-MM-DDTHH:mm"
            ).toDate();
            setNewEvent({ ...newEvent, end: selectedDate });
          }}
        />
      </div>
      <button onClick={handleAddEvent}>Add Event</button>
      {showDetails && (
        <div
          className="event-details-popup"
          style={{
            backgroundColor: PROPERTIES.find(
              (property) => property.property_id === selectedEvent.property_id
            )?.color,
          }}
        >
          <h2>{selectedEvent.title}</h2>
          <h4>
            Property:{" "}
            {
              PROPERTIES.find(
                (property) => property.property_id === selectedEvent.property_id
              )?.name
            }
          </h4>

          <h4>
            Facility: {FACILITY_TYPES[selectedEvent.facility_id - 1].name}
          </h4>
          <p>Start: {moment(selectedEvent.start).format("LLL")}</p>
          <p>End: {moment(selectedEvent.end).format("LLL")}</p>
          <button onClick={handleDeleteEvent}>Delete Event</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
      <br />

      <select value={propertyFilter} onChange={handlePropertyFilter}>
        <option value="">Filter by Property</option>
        {PROPERTIES.map((property) => (
          <option key={property.property_id} value={property.property_id}>
            {property.name}
          </option>
        ))}
      </select>
      {propertyFilter && (
        <div>
          <select value={facilityFilter} onChange={handleFacilityFilter}>
            <option value="">Filter by Facility</option>
            {FACILITY_TYPES.filter((facility) =>
              PROPERTIES.find(
                (property) => property.property_id === Number(propertyFilter)
              ).facilities.includes(facility.id)
            ).map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor={(event) => moment(event.start).toDate()}
        endAccessor={(event) => moment(event.end).toDate()}
        style={{ height: 500, margin: "50px" }}
        date={selectedDay}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={(event) => {
          const property = PROPERTIES.find(
            (p) => p.property_id === event.property_id
          );
          return {
            style: {
              backgroundColor: property.color,
              color: "#4a4a4a",
            },
          };
        }}
      />
    </div>
  );
}
