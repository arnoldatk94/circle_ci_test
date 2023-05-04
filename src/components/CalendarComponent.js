import "../App";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { events } from "./events";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";

const locales = { "en-us": require("date-fns/locale/en-US") };
const localizer = dateFnsLocalizer({
  format,
  parse,
  getDay,
  startOfWeek,
  locales,
});

export default function CalendarComponent() {
  const [newEvent, setNewEvent] = useState({
    property_id: 1, // Hardcode first
    facility_id: 1,
    title: "",
    start: "",
    end: "",
  });
  const [allEvents, setAllEvents] = useState(events);
  const [propertyFilter, setPropertyFilter] = useState();
  const [facilityFilter, setFacilityFilter] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date());

  function handleNavigate(date) {
    setSelectedDay(date);
  }

  function handleSelectEvent(event) {
    setSelectedDay(event.start);
  }

  useEffect(() => {
    console.log("events", events);
  });
  // Check all events
  useEffect(() => {
    console.log(allEvents);
  }, [allEvents]);

  // helper function to convert adding of event
  function convertInputToDate(input) {
    const [date, time] = input.split("T");
    const [year, month, day] = date.split("-");
    const [hour, minute] = time.split(":");
    return new Date(year, month - 1, day, hour, minute);
  }

  const handleAddEvent = () => {
    setAllEvents([...allEvents, newEvent]);
  };

  function handleDeleteEvent(event) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (confirmDelete) {
      const updatedEvents = allEvents.filter((e) => e !== event);
      setAllEvents(updatedEvents);
    }
  }

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

  return (
    <div>
      <h1>Calendar</h1>
      <h2>Add New Event</h2>
      <div style={{ display: "inline-flex", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Add Title"
          style={{ width: "20%", marginRight: "10px" }}
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
        />
        <input
          type="datetime-local"
          placeholder="Start Date"
          style={{ width: "40%", marginRight: "10px" }}
          value={
            newEvent.start ? newEvent.start.toISOString().slice(0, -8) : ""
          }
          onChange={(e) => {
            const selectedDate = convertInputToDate(e.target.value);
            setNewEvent({ ...newEvent, start: selectedDate });
          }}
        />
        <input
          type="datetime-local"
          placeholder="End Date"
          style={{ width: "40%" }}
          value={newEvent.end ? newEvent.end.toISOString().slice(0, -8) : ""}
          onChange={(e) => {
            const selectedDate = convertInputToDate(e.target.value);
            setNewEvent({ ...newEvent, end: selectedDate });
          }}
        />
      </div>
      <button onClick={handleAddEvent}>Add Event</button>
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor={(event) => moment(event.start).toDate()}
        endAccessor={(event) => moment(event.end).toDate()}
        style={{ height: 500, margin: "50px" }}
        // onSelectEvent={(event) => console.log(event)}
        date={selectedDay}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        onDoubleClickEvent={handleDeleteEvent}
      />
      <input
        type="text"
        placeholder="Filter by Property ID"
        value={propertyFilter}
        onChange={handlePropertyFilter}
      />
      {propertyFilter && (
        <input
          type="text"
          placeholder="Filter by Facility ID"
          value={facilityFilter}
          onChange={handleFacilityFilter}
        />
      )}
      {/* <table>
        <thead>
          <tr>
            <th>Property ID</th>
            <th>Facility ID</th>
            <th>Title</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event) => (
            <tr key={event.title}>
              <td>{event.property_id}</td>
              <td>{event.facility_id}</td>
              <td>{event.title}</td>
              <td>{event.start.toString()}</td>
              <td>{event.end.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
}
